from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import CUENTA_DESACTIVADA, CurrentUser
from app.core.security import ACCESS_TOKEN_COOKIE
from app.modules.auth.schemas import Mensaje
from app.modules.auth.service import (
    AuthService,
    CredencialesInvalidas,
    CuentaDesactivada,
    UsuarioDuplicado,
)
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


ServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Registra un usuario con rol user",
)
def registrar(data: UserCreate, service: ServiceDep) -> UserPublic:
    try:
        return service.registrar(data)
    except UsuarioDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=str(e))


@router.post("/token", response_model=Mensaje, summary="Login: deja el JWT en una cookie HttpOnly")
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: ServiceDep,
) -> Mensaje:
    try:
        token = service.autenticar(form_data.username, form_data.password)
    except CredencialesInvalidas as e:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, detail=str(e), headers={"WWW-Authenticate": "Bearer"}
        )
    except CuentaDesactivada:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=CUENTA_DESACTIVADA)

    # HttpOnly: JavaScript no puede leer el token. SameSite=lax mitiga CSRF.
    # El token no va en el cuerpo de la respuesta.
    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE,
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
    )
    return Mensaje(message="Login exitoso")


@router.post("/logout", response_model=Mensaje, summary="Cierra la sesión borrando la cookie")
def logout(response: Response) -> Mensaje:
    response.delete_cookie(
        key=ACCESS_TOKEN_COOKIE, httponly=True, samesite="lax", secure=settings.COOKIE_SECURE
    )
    return Mensaje(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic, summary="Usuario de la sesión actual")
def me(current_user: CurrentUser) -> UserPublic:
    return current_user
