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

## Backend

### Requisitos

- Python **3.11 a 3.13** (SQLModel no funciona con 3.14).
- PostgreSQL 15 o superior. Si no está instalado, se puede levantar con Docker (incluido en el proyecto).

### Instalación y ejecución

Todos los comandos se ejecutan dentro de `backend/`.

```bash
cd backend

# 1. Base de datos (opcional si ya hay un PostgreSQL con la base foodstore_db)
docker compose up -d

# 2. Entorno virtual y dependencias
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Linux / macOS
pip install -r requirements.txt

# 3. Variables de entorno
copy .env.example .env          # Windows
# cp .env.example .env          # Linux / macOS

# 4. Datos iniciales (admin, categorías y productos); se puede correr varias veces
python -m app.db.seed

# 5. Servidor
uvicorn app.main:app --reload
```

La API queda en `http://localhost:8000/api/v1`, con la documentación en [`/docs`](http://localhost:8000/docs) y [`/redoc`](http://localhost:8000/redoc).

### Variables de entorno (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base. Debe incluir `+psycopg2`: desde SQLAlchemy 2.1, `postgresql://` busca el driver psycopg 3, que no está instalado. Para desarrollo sin PostgreSQL se acepta `sqlite:///./foodstore.db`. | `postgresql+psycopg2://postgres:postgres@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Clave para firmar el JWT, de al menos 32 caracteres. Obligatoria. | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT. | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión (token y cookie). | `30` |
| `FRONTEND_ORIGIN` | Origen del frontend autorizado por CORS con credenciales. | `http://localhost:5173` |
| `COOKIE_SECURE` | Opcional. `true` en producción con HTTPS. | `false` |

### Usuario administrador del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | `admin` |

Los clientes se registran desde la aplicación (o con `POST /api/v1/auth/register`) y reciben el rol `user`.

### Probar la API desde `/docs`

La sesión viaja en una cookie HttpOnly, no en un encabezado. Para usar las rutas protegidas desde Swagger, ejecutar `POST /auth/token` con usuario y contraseña: el navegador guarda la cookie y la envía en las siguientes peticiones. El botón «Authorize» no sirve, porque la API no acepta el token en el encabezado `Authorization`.

### Endpoints

| Recurso | Endpoints | Acceso |
|---|---|---|
| Autenticación | `POST /auth/register`, `POST /auth/token`, `POST /auth/logout`, `GET /auth/me` | Público / sesión |
| Usuarios | `GET /admin/usuarios`, `POST /admin/usuarios/{id}/activar`, `POST /admin/usuarios/{id}/desactivar` | admin |
| Categorías | `GET /categorias`, `GET /categorias/{id}` · `POST`, `PUT`, `DELETE` | Lectura pública · escritura admin |
| Productos | `GET /productos` (paginado, `search`, `categoria_id`, `disponible`), `GET /productos/{id}` · `POST`, `PUT`, `PATCH /{id}/stock`, `DELETE` | Lectura pública · escritura admin |
| Pedidos | `POST /pedidos`, `GET /pedidos`, `GET /pedidos/{id}`, `PATCH /pedidos/{id}/cancelar` | Sesión (dueño o admin) |
| Pedidos (admin) | `GET /pedidos/resumen`, `PATCH /pedidos/{id}/estado` | admin |

### Reglas de negocio de los pedidos

- **RN-01:** el pedido se crea completo o no se crea. Valida que no haya productos repetidos, que cada producto esté activo y disponible y que alcance el stock; descuenta el stock y copia el nombre y el precio en cada línea, todo en una sola transacción.
- **RN-02:** máquina de estados `PENDIENTE → EN_PREPARACION → ENTREGADO`, con cancelación desde `PENDIENTE` o `EN_PREPARACION`. `ENTREGADO` y `CANCELADO` son terminales.
- **RN-03:** cancelar restituye el stock de cada línea en la misma transacción.
- **RN-04:** el cliente solo ve y cancela sus pedidos, y solo cancela en `PENDIENTE`; el admin ve todos y los avanza o cancela.
- **RN-05:** las líneas y el total no cambian después de crear el pedido.
- **RN-06:** `forma_pago` es `EFECTIVO` o `TRANSFERENCIA`; `direccion_entrega` tiene entre 5 y 200 caracteres.

Al crear o cancelar un pedido se bloquean las filas de los productos afectados (`SELECT … FOR UPDATE`), así dos pedidos simultáneos no venden más stock del que hay.
