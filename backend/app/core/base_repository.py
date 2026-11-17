from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Operaciones CRUD comunes a todos los modelos. Cada módulo lo hereda y agrega sus consultas.

    Nunca hace commit: solo el Unit of Work confirma o descarta la transacción.
    """

    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, entity_id: int) -> T | None:
        return self.session.get(self.model, entity_id)

    def get_all(self) -> list[T]:
        return list(self.session.exec(select(self.model)).all())

    def add(self, entity: T) -> T:
        """Agrega una entidad nueva o guarda los cambios de una existente.

        El flush envía el INSERT/UPDATE dentro de la transacción en curso (sin confirmarla), así la
        entidad obtiene su id; el refresh recarga sus columnas y relaciones desde la base.
        """
        self.session.add(entity)
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        """Borrado físico. Las entidades con baja lógica no lo usan."""
        self.session.delete(entity)
        self.session.flush()
