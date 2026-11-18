from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import AdminUser, require_admin
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import AutoDesactivacion, UsuarioNoEncontrado, UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

# Todas las rutas de este router son solo para admin
router = APIRouter(
    prefix="/admin/usuarios",
    tags=["Usuarios (admin)"],
    dependencies=[Depends(require_admin)],
)


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("", response_model=list[UserPublic], summary="Lista todos los usuarios")
def listar_usuarios(service: ServiceDep) -> list[UserPublic]:
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic, summary="Alta lógica (disabled = false)")
def activar_usuario(usuario_id: int, service: ServiceDep) -> UserPublic:
    try:
        return service.activar(usuario_id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/{usuario_id}/desactivar",
    response_model=UserPublic,
    summary="Baja lógica (disabled = true)",
)
def desactivar_usuario(usuario_id: int, admin: AdminUser, service: ServiceDep) -> UserPublic:
    try:
        return service.desactivar(usuario_id, admin_id=admin.id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e))
    except AutoDesactivacion as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e))
