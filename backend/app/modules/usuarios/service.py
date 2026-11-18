from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

# --- Excepciones de dominio (el Router las traduce a códigos HTTP) ---


class UsuarioNoEncontrado(Exception):
    def __init__(self, usuario_id: int) -> None:
        super().__init__(f"El usuario {usuario_id} no existe")


class AutoDesactivacion(Exception):
    def __init__(self) -> None:
        super().__init__("Un administrador no puede desactivarse a sí mismo")


def _obtener_usuario(uow: UsuarioUnitOfWork, usuario_id: int) -> Usuario:
    usuario = uow.usuarios.get_by_id(usuario_id)
    if usuario is None:
        raise UsuarioNoEncontrado(usuario_id)
    return usuario


class UsuarioService:
    """Gestión de cuentas por el administrador. Activar y desactivar son idempotentes."""

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_all()]

    def activar(self, usuario_id: int) -> UserPublic:
        return self._cambiar_estado(usuario_id, disabled=False)

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        if usuario_id == admin_id:
            raise AutoDesactivacion()
        return self._cambiar_estado(usuario_id, disabled=True)

    def _cambiar_estado(self, usuario_id: int, *, disabled: bool) -> UserPublic:
        with self.uow as uow:
            usuario = _obtener_usuario(uow, usuario_id)
            usuario.disabled = disabled
            return UserPublic.model_validate(uow.usuarios.add(usuario))
