from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel


class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    full_name: str
    email: str = Field(unique=True, index=True)
    hashed_password: str
    # "user" o "admin"; el registro público siempre crea "user"
    role: str = Field(default="user")
    # Baja lógica: el admin activa o desactiva la cuenta
    disabled: bool = Field(default=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
    )
