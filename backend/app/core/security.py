from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# Nombre de la cookie HttpOnly que transporta el JWT
ACCESS_TOKEN_COOKIE = "access_token"

# bcrypt: hash lento y con sal aleatoria. passlib 1.7.4 requiere bcrypt==4.0.1.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """Firma un JWT con los datos recibidos, el tipo "access" y la expiración.

    El payload se puede leer (está firmado, no cifrado): no debe llevar datos sensibles.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"type": "access", "exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any] | None:
    """Devuelve el payload si la firma, la expiración y el tipo son válidos; si no, None."""
    try:
        # Lista fija de algoritmos: el token no puede elegir uno que evite la verificación
        payload: dict[str, Any] = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
    except JWTError:  # firma inválida, token vencido o mal formado
        return None
    if payload.get("type") != "access":
        return None
    return payload
