from datetime import datetime

from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    """Datos del registro público. La contraseña llega en texto plano y el Service guarda su hash."""

    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    # bcrypt solo procesa los primeros 72 bytes
    password: str = Field(min_length=8, max_length=72)

    @field_validator("username", "full_name", mode="before")
    @classmethod
    def quitar_espacios_extremos(cls, value: object) -> object:
        # mode="before": se recorta antes de validar el largo mínimo
        return value.strip() if isinstance(value, str) else value

    @field_validator("username")
    @classmethod
    def validar_username(cls, value: str) -> str:
        if " " in value:
            raise ValueError("El nombre de usuario no puede tener espacios")
        return value

    @field_validator("email")
    @classmethod
    def normalizar_email(cls, value: str) -> str:
        return value.lower()

    @field_validator("password")
    @classmethod
    def validar_largo_en_bytes(cls, value: str) -> str:
        # Un carácter acentuado ocupa más de un byte en UTF-8: el límite real de bcrypt es en bytes
        if len(value.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar los 72 bytes")
        return value


class UserPublic(SQLModel):
    """Lo que la API expone de un usuario: nunca incluye hashed_password."""

    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
