from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: int | None = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categorias.id", index=True)
    nombre: str = Field(index=True)
    descripcion: str | None = None
    # Las restricciones (>= 0) se validan en los schemas y en el Service, no con CHECK en la base
    precio_base: float
    imagen_url: str | None = None
    stock: int = Field(default=0)
    disponible: bool = Field(default=True)
    # Baja lógica
    activo: bool = Field(default=True)

    categoria: "Categoria" = Relationship(back_populates="productos")
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")
