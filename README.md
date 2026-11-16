# Food Store

Trabajo Práctico Integrador de **Programación 4** (Tecnicatura Universitaria en Programación a Distancia, UTN).

Aplicación web para un negocio de comidas: los clientes recorren el catálogo, arman un carrito y confirman pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios.

**Repositorio:** https://github.com/ElianRivoira/TPI-Prog4-UTN

> En desarrollo. Las instrucciones de instalación y ejecución se completan a medida que avanza el proyecto.

## Stack

| Parte | Tecnologías |
|---|---|
| Backend | Python 3.11 a 3.13, FastAPI, SQLModel, PostgreSQL, JWT en cookie HttpOnly |
| Frontend | React + TypeScript, Vite, Tailwind CSS, TanStack Query / Form / Table, Zustand, Axios |

## Estructura del repositorio

```
.
├── backend/    API REST (FastAPI + SQLModel) bajo /api/v1
└── frontend/   Aplicación React + TypeScript
```

El backend se organiza por módulos de dominio (`usuarios`, `auth`, `categorias`, `productos`, `pedidos`), cada uno con su cadena Router → Service → Unit of Work → Repository → Model. El frontend se organiza por features que espejan esos módulos.
