from app.modules.categorias.service import obtener_categoria_activa
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork

# --- Excepciones de dominio (el Router las traduce a códigos HTTP) ---
# Si la categoría no existe o está dada de baja se lanza CategoriaNoEncontrada (módulo categorias).


class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"El producto {producto_id} no existe")


def obtener_producto_activo(uow: ProductoUnitOfWork, producto_id: int) -> Producto:
    """Un producto dado de baja se trata como inexistente."""
    producto = uow.productos.get_by_id(producto_id)
    if producto is None or not producto.activo:
        raise ProductoNoEncontrado(producto_id)
    return producto


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        *,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            productos, total = uow.productos.search(
                skip=skip, limit=limit, search=search, categoria_id=categoria_id, disponible=disponible
            )
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in productos]
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(obtener_producto_activo(uow, producto_id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            obtener_categoria_activa(uow.categorias, data.categoria_id)
            producto = uow.productos.add(Producto.model_validate(data))
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = obtener_producto_activo(uow, producto_id)
            cambios = data.model_dump(exclude_unset=True, exclude_none=True)
            if "categoria_id" in cambios:
                obtener_categoria_activa(uow.categorias, cambios["categoria_id"])

            producto.sqlmodel_update(cambios)
            producto = uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = obtener_producto_activo(uow, producto_id)
            producto.stock = data.stock
            producto.disponible = data.disponible
            producto = uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        """Baja lógica: el producto deja de listarse, pero sus líneas de pedido se conservan."""
        with self.uow as uow:
            producto = obtener_producto_activo(uow, producto_id)
            producto.activo = False
            uow.productos.add(producto)
