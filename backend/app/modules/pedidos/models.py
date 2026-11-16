from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


def _ahora() -> datetime:
    return datetime.now(timezone.utc)


class Pedido(SQLModel, table=True):
    """Pedido de un usuario. No se borra: se cancela."""

    __tablename__ = "pedidos"

    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id", index=True)
    # PENDIENTE, EN_PREPARACION, ENTREGADO o CANCELADO (máquina de estados en el Service)
    estado: str = Field(default="PENDIENTE", index=True)
    # EFECTIVO o TRANSFERENCIA (validado en el schema)
    forma_pago: str
    direccion_entrega: str = Field(max_length=200)
    notas: str | None = None
    # Suma de los subtotales de las líneas; fija desde la creación
    total: float = Field(default=0)
    created_at: datetime = Field(default_factory=_ahora, sa_type=DateTime(timezone=True))
    updated_at: datetime = Field(default_factory=_ahora, sa_type=DateTime(timezone=True))

    usuario: "Usuario" = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    """Línea inmutable de un pedido.

    Guarda una copia del nombre y del precio del producto al momento de la compra, para que el
    pedido no cambie si después se edita el producto.
    """

    __tablename__ = "detalles_pedido"

    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", index=True)
    producto_id: int = Field(foreign_key="productos.id", index=True)
    cantidad: int
    nombre_producto: str
    precio_unitario: float
    # precio_unitario * cantidad
    subtotal: float

    pedido: Pedido = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="detalles")
