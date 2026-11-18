from datetime import datetime
from enum import StrEnum

from pydantic import field_validator
from sqlmodel import Field, SQLModel


class EstadoPedido(StrEnum):
    PENDIENTE = "PENDIENTE"
    EN_PREPARACION = "EN_PREPARACION"
    ENTREGADO = "ENTREGADO"
    CANCELADO = "CANCELADO"


class FormaPago(StrEnum):
    EFECTIVO = "EFECTIVO"
    TRANSFERENCIA = "TRANSFERENCIA"


# --- Entrada ---


class ItemPedidoCreate(SQLModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    """Pedido armado desde el carrito (RN-01 y RN-06).

    Solo se reciben productos y cantidades: el nombre y el precio se copian del producto en el
    Service, nunca se toman del cliente.
    """

    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str | None = Field(default=None, max_length=500)

    @field_validator("direccion_entrega", "notas", mode="before")
    @classmethod
    def quitar_espacios_extremos(cls, value: object) -> object:
        # mode="before": se recorta antes de validar el largo mínimo
        return value.strip() if isinstance(value, str) else value


class CambioEstado(SQLModel):
    estado: EstadoPedido


# --- Salida ---


class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: EstadoPedido
    forma_pago: FormaPago
    direccion_entrega: str
    notas: str | None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
