"""Dependencias de sesión y rol. Se encadenan: require_role -> get_current_active_user -> get_current_user.

- 401: no hay sesión válida (falta la cookie, o el token es inválido o venció).
- 400: la cuenta está desactivada.
- 403: hay sesión, pero el rol no está permitido.
"""

from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from app.core.security import ACCESS_TOKEN_COOKIE, decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    """Lee el token solo de la cookie HttpOnly; el encabezado Authorization no se acepta."""

    async def __call__(self, request: Request) -> str | None:
        token = request.cookies.get(ACCESS_TOKEN_COOKIE)
        if not token:
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No autenticado",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return None
        return token


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token")


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> UserPublic:
    """Valida el token y carga el usuario desde la base en cada petición, para que una
    desactivación tenga efecto aunque el token siga vigente."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o token expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    username = payload.get("sub") if payload else None
    if not isinstance(username, str):
        raise credentials_exception

    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(username)
        if usuario is None:
            raise credentials_exception
        return UserPublic.model_validate(usuario)


def get_current_active_user(
    current_user: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    if current_user.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=CUENTA_DESACTIVADA)
    return current_user


def require_role(allowed_roles: list[str]) -> Callable[[UserPublic], UserPublic]:
    """Fábrica de dependencias: devuelve una que responde 403 si el rol no está en la lista."""

    def role_checker(
        current_user: Annotated[UserPublic, Depends(get_current_active_user)],
    ) -> UserPublic:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta acción",
            )
        return current_user

    return role_checker


# Una sola instancia: FastAPI la resuelve una vez por petición aunque se declare varias veces
require_admin = require_role(["admin"])

CurrentUser = Annotated[UserPublic, Depends(get_current_active_user)]
AdminUser = Annotated[UserPublic, Depends(require_admin)]
