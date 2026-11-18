from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.db import models as _models  # noqa: F401  (registra las tablas antes de crearlas)
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.productos.router import router as productos_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Al iniciar: crea las tablas que falten
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="API REST del sistema de pedidos de comida (TPI Programación 4).",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS con credenciales: el navegador solo adjunta la cookie de sesión si el origen está
# permitido explícitamente (con allow_credentials no se puede usar el comodín "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Todos los endpoints de la API cuelgan de /api/v1
api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(categorias_router)
api_router.include_router(productos_router)

app.include_router(api_router)
