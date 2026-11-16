from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"

    id: int | None = Field(default=None, primary_key=True)
    # Único aunque la categoría esté dada de baja: la baja lógica no libera el nombre
    nombre: str = Field(max_length=100, unique=True, index=True)
    descripcion: str | None = None
    # Baja lógica
    activo: bool = Field(default=True)

    productos: list["Producto"] = Relationship(back_populates="categoria")
