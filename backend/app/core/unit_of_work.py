from collections.abc import Callable
from types import TracebackType
from typing import Self

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    """Controla la transacción de un caso de uso.

    El Service lo abre con `with self.uow as uow:`. Al entrar crea la sesión; al salir hace commit si
    no hubo errores o rollback si hubo una excepción, y siempre cierra la sesión. Es el único lugar
    del proyecto que llama a commit() y rollback().

    Cada módulo lo hereda y, en __enter__, crea los repositorios que comparten la sesión.
    """

    session: Session

    def __init__(self, session_factory: Callable[[], Session] = default_session_factory) -> None:
        self.session_factory = session_factory

    def __enter__(self) -> Self:
        self.session = self.session_factory()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        # try/finally: la sesión se cierra aunque el commit falle (por ejemplo, por una restricción
        # de unicidad). Como no se devuelve True, la excepción original sigue hacia el Router.
        try:
            if exc_type is not None:
                self.session.rollback()
            else:
                self.session.commit()
        finally:
            self.session.close()
