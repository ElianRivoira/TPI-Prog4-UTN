from typing import Self

from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Expone pedidos y productos sobre la misma sesión: crear o cancelar un pedido modifica el
    stock de los productos en la misma transacción."""

    pedidos: PedidoRepository
    productos: ProductoRepository

    def __enter__(self) -> Self:
        super().__enter__()
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self
