from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_admin
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]


@router.get("", response_model=list[CategoriaRead], summary="Lista las categorías activas")
def listar_categorias(service: ServiceDep) -> list[CategoriaRead]:
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead, summary="Detalle de una categoría")
def obtener_categoria(categoria_id: int, service: ServiceDep) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crea una categoría (nombre único)",
    dependencies=[Depends(require_admin)],
)
def crear_categoria(data: CategoriaCreate, service: ServiceDep) -> CategoriaRead:
    try:
        return service.crear(data)
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=str(e))


@router.put(
    "/{categoria_id}",
    response_model=CategoriaRead,
    summary="Actualiza los campos enviados",
    dependencies=[Depends(require_admin)],
)
def actualizar_categoria(
    categoria_id: int, data: CategoriaUpdate, service: ServiceDep
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e))
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=str(e))


@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Baja lógica de una categoría",
    dependencies=[Depends(require_admin)],
)
def eliminar_categoria(categoria_id: int, service: ServiceDep) -> None:
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e))
