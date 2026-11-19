from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import CurrentUser, require_admin
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ReglaDeNegocio,
)
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


@router.get("", response_model=PedidosPaginados, summary="Pedidos propios (user) o todos (admin)")
def listar_pedidos(
    usuario: CurrentUser,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
) -> PedidosPaginados:
    return service.listar(usuario, skip=skip, limit=limit, estado=estado)


# Se declara antes de /{pedido_id}: si no, FastAPI intentaría interpretar "resumen" como un id
@router.get(
    "/resumen",
    response_model=ResumenPedidos,
    summary="Indicadores del panel de administración",
    dependencies=[Depends(require_admin)],
)
def resumen_pedidos(service: ServiceDep) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead, summary="Detalle con sus líneas (dueño o admin)")
def obtener_pedido(pedido_id: int, usuario: CurrentUser, service: ServiceDep) -> PedidoRead:
    try:
        return service.obtener(pedido_id, usuario)
    except PedidoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e))
    except PedidoAjeno as e:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail=str(e))


@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoRead,
    summary="Avanza o cancela según la máquina de estados (RN-02, RN-03)",
    dependencies=[Depends(require_admin)],
)
def cambiar_estado(pedido_id: int, data: CambioEstado, service: ServiceDep) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except PedidoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e))
    except ReglaDeNegocio as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch(
    "/{pedido_id}/cancelar",
    response_model=PedidoRead,
    summary="El dueño cancela su pedido PENDIENTE y se restituye el stock (RN-03, RN-04)",
)
def cancelar_pedido(pedido_id: int, usuario: CurrentUser, service: ServiceDep) -> PedidoRead:
    try:
        return service.cancelar_propio(pedido_id, usuario)
    except PedidoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e))
    except PedidoAjeno as e:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail=str(e))
    except ReglaDeNegocio as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e))
