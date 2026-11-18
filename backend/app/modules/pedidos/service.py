from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import EstadoPedido, PedidoCreate, PedidoRead
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado

# --- Excepciones de dominio (el Router las traduce a códigos HTTP) ---
# Si un producto no existe o está dado de baja se lanza ProductoNoEncontrado (módulo productos): 404.


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


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

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
