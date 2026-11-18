from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import CurrentUser
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead
from app.modules.pedidos.service import PedidoService, ReglaDeNegocio
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]


@router.post(
    "",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crea un pedido desde el carrito (RN-01)",
)
def crear_pedido(data: PedidoCreate, usuario: CurrentUser, service: ServiceDep) -> PedidoRead:
    try:
        return service.crear(usuario.id, data)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e))
    except ReglaDeNegocio as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e))
