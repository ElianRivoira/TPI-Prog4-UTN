from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

# --- Excepciones de dominio (el Router las traduce a códigos HTTP) ---


class UsuarioDuplicado(Exception):
    pass


class CredencialesInvalidas(Exception):
    def __init__(self) -> None:
        # Mismo mensaje si el usuario no existe o si la contraseña no coincide:
        # la respuesta no revela cuál de los dos datos falló
        super().__init__("Credenciales incorrectas")


class CuentaDesactivada(Exception):
    pass


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        """Registro público: siempre crea usuarios con rol "user"."""
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username) is not None:
                raise UsuarioDuplicado("El nombre de usuario ya está en uso")
            if uow.usuarios.get_by_email(data.email) is not None:
                raise UsuarioDuplicado("El email ya está registrado")

            usuario = Usuario(
                username=data.username,
                full_name=data.full_name,
                email=data.email,
                hashed_password=hash_password(data.password),
                role="user",
            )
            return UserPublic.model_validate(uow.usuarios.add(usuario))

    def autenticar(self, username: str, password: str) -> str:
        """Verifica las credenciales y devuelve el JWT firmado."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username.strip())
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise CredencialesInvalidas()
            # Se verifica después de la contraseña, para no revelar el estado de cuentas ajenas
            if usuario.disabled:
                raise CuentaDesactivada()
            return create_access_token({"sub": usuario.username, "role": usuario.role})
