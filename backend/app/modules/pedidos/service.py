from datetime import datetime, timezone

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import EstadoPedido, PedidoCreate, PedidoRead, PedidosPaginados
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

# --- Excepciones de dominio (el Router las traduce a códigos HTTP) ---
# Si un producto no existe o está dado de baja se lanza ProductoNoEncontrado (módulo productos): 404.


class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int) -> None:
        super().__init__(f"El pedido {pedido_id} no existe")


class PedidoAjeno(Exception):
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class ReglaDeNegocio(Exception):
    """Base de las reglas de negocio que no se cumplen: el Router responde 400."""


class ProductoRepetido(ReglaDeNegocio):
    def __init__(self) -> None:
        super().__init__("Un producto no puede repetirse en el pedido: ajustá la cantidad")


class ProductoNoDisponible(ReglaDeNegocio):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(ReglaDeNegocio):
    def __init__(self, nombre: str, disponible: int) -> None:
        super().__init__(f"Stock insuficiente para '{nombre}' (disponible: {disponible})")


class TransicionInvalida(ReglaDeNegocio):
    def __init__(self, actual: str, nuevo: str) -> None:
        if not TRANSICIONES[EstadoPedido(actual)]:
            mensaje = f"El pedido está {actual}: no admite cambios de estado"
        else:
            mensaje = f"No se puede pasar un pedido de {actual} a {nuevo}"
        super().__init__(mensaje)


class PedidoNoCancelable(ReglaDeNegocio):
    def __init__(self, actual: str) -> None:
        super().__init__(f"Solo se puede cancelar un pedido PENDIENTE (estado actual: {actual})")


# --- Máquina de estados (RN-02): estado actual -> estados a los que puede pasar ---
TRANSICIONES: dict[EstadoPedido, set[EstadoPedido]] = {
    EstadoPedido.PENDIENTE: {EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO},
    EstadoPedido.EN_PREPARACION: {EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO},
    EstadoPedido.ENTREGADO: set(),  # terminal
    EstadoPedido.CANCELADO: set(),  # terminal
}


def _es_admin(usuario: UserPublic) -> bool:
    return usuario.role == "admin"


def _verificar_acceso(pedido: Pedido, usuario: UserPublic) -> None:
    """RN-04: el cliente solo accede a sus pedidos; el admin, a todos."""
    if not _es_admin(usuario) and pedido.usuario_id != usuario.id:
        raise PedidoAjeno()


def _obtener_para_modificar(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
    pedido = uow.pedidos.get_for_update(pedido_id)
    if pedido is None:
        raise PedidoNoEncontrado(pedido_id)
    return pedido


def _aplicar_transicion(uow: PedidoUnitOfWork, pedido: Pedido, nuevo: EstadoPedido) -> PedidoRead:
    """Valida la transición antes de modificar el pedido (RN-02). Si el nuevo estado es CANCELADO,
    restituye el stock de cada línea en la misma transacción (RN-03)."""
    if nuevo not in TRANSICIONES[EstadoPedido(pedido.estado)]:
        raise TransicionInvalida(pedido.estado, nuevo)

    if nuevo == EstadoPedido.CANCELADO:
        uow.productos.lock_by_ids([detalle.producto_id for detalle in pedido.items])
        for detalle in pedido.items:
            producto = uow.productos.get_by_id(detalle.producto_id)
            # El producto puede estar dado de baja: su stock se restituye igual
            if producto is not None:
                producto.stock += detalle.cantidad

    pedido.estado = nuevo
    pedido.updated_at = datetime.now(timezone.utc)
    return PedidoRead.model_validate(uow.pedidos.add(pedido))


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self, usuario: UserPublic, *, skip: int, limit: int, estado: EstadoPedido | None
    ) -> PedidosPaginados:
        """El admin ve todos los pedidos; el cliente, solo los propios."""
        with self.uow as uow:
            pedidos, total = uow.pedidos.list_by_usuario(
                None if _es_admin(usuario) else usuario.id, skip=skip, limit=limit, estado=estado
            )
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in pedidos]
            )

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)
            _verificar_acceso(pedido, usuario)
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo: EstadoPedido) -> PedidoRead:
        """El admin avanza o cancela un pedido desde cualquier estado no terminal."""
        with self.uow as uow:
            pedido = _obtener_para_modificar(uow, pedido_id)
            return _aplicar_transicion(uow, pedido, nuevo)

    def cancelar_propio(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        """El cliente cancela su propio pedido, solo mientras está PENDIENTE (RN-03, RN-04)."""
        with self.uow as uow:
            pedido = _obtener_para_modificar(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != EstadoPedido.PENDIENTE:
                raise PedidoNoCancelable(pedido.estado)
            return _aplicar_transicion(uow, pedido, EstadoPedido.CANCELADO)

    def crear(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        """RN-01: crea el pedido completo o no crea nada.

        Todo ocurre dentro de un único Unit of Work: si una validación falla en cualquier ítem, el
        rollback descarta el pedido, las líneas ya creadas y el stock ya descontado.
        """
        producto_ids = [item.producto_id for item in data.items]
        if len(producto_ids) != len(set(producto_ids)):
            raise ProductoRepetido()

        with self.uow as uow:
            # Bloquea los productos del pedido: nadie más puede descontar su stock hasta el commit
            uow.productos.lock_by_ids(producto_ids)

            pedido = Pedido(
                usuario_id=usuario_id,
                estado=EstadoPedido.PENDIENTE,
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0,
            )
            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock)

                producto.stock -= item.cantidad
                # RN-05: la línea guarda una copia del nombre y del precio actuales
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            pedido = uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)
