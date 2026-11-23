from pydantic import field_validator
from sqlmodel import Field, SQLModel


class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = None

    @field_validator("nombre", mode="before")
    @classmethod
    def quitar_espacios_extremos(cls, value: object) -> object:
        # mode="before": se recorta antes de validar el largo mínimo
        return value.strip() if isinstance(value, str) else value


class CategoriaUpdate(SQLModel):
    """Actualización parcial: solo se modifican los campos enviados con un valor distinto de null."""

    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None

    @field_validator("nombre", mode="before")
    @classmethod
    def quitar_espacios_extremos(cls, value: object) -> object:
        # mode="before": se recorta antes de validar el largo mínimo
        return value.strip() if isinstance(value, str) else value


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool
