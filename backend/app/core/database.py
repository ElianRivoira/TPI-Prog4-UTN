from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# SQLite (solo para desarrollo) necesita check_same_thread=False porque FastAPI atiende en varios hilos
_connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=_connect_args,
    pool_pre_ping=True,  # descarta conexiones cortadas, por ejemplo si se reinició PostgreSQL
)


def create_all_tables() -> None:
    """Crea las tablas de los modelos registrados en SQLModel.metadata que todavía no existen."""
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Abre una sesión nueva. El Unit of Work la usa y se encarga del commit, rollback y close."""
    # expire_on_commit=False: los objetos siguen legibles después del commit (evita un error 500
    # al armar la respuesta con datos que SQLAlchemy dio por vencidos)
    return Session(engine, expire_on_commit=False)
