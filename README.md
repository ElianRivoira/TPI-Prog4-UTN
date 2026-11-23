# Food Store

Trabajo Práctico Integrador de **Programación 4** (Tecnicatura Universitaria en Programación a Distancia, UTN).

Aplicación web para un negocio de comidas: los clientes recorren el catálogo, arman un carrito y confirman pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios.

**Repositorio:** https://github.com/ElianRivoira/TPI-Prog4-UTN

## Stack

| Parte | Tecnologías |
|---|---|
| Backend | Python 3.11 a 3.13, FastAPI, SQLModel, PostgreSQL, JWT en cookie HttpOnly |
| Frontend | React 19 + TypeScript (strict), Vite 7, Tailwind CSS 4, TanStack Query / Form / Table, Zustand, Axios, React Router 7 |

## Requisitos

| Herramienta | Versión | Para qué |
|---|---|---|
| Python | **3.11 a 3.13** (SQLModel no funciona con 3.14) | Backend |
| PostgreSQL | 15 o superior, o **Docker** para levantarlo con el `docker-compose.yml` incluido | Base de datos |
| Node.js | 20.19 o superior | Frontend |
| pnpm | 9 o superior (`npm install -g pnpm`) | Frontend |

## Puesta en marcha

El backend y el frontend son dos proyectos independientes y se ejecutan en **dos terminales**. Primero el backend:

1. [Backend](#backend): base de datos, dependencias, `.env`, seed y `uvicorn` (queda en `http://localhost:8000`).
2. [Frontend](#frontend): dependencias, `.env` y `pnpm dev` (queda en `http://localhost:5173`).
3. Abrir `http://localhost:5173` e iniciar sesión con el [usuario administrador del seed](#usuario-administrador-del-seed) o registrar un cliente.

## Estructura del repositorio

```
.
├── backend/
│   ├── app/
│   │   ├── main.py            App FastAPI, CORS con credenciales y prefijo /api/v1
│   │   ├── core/              Configuración, base de datos, seguridad, dependencias,
│   │   │                      UnitOfWork base y BaseRepository[T]
│   │   ├── modules/           Un paquete por dominio: auth, usuarios, categorias,
│   │   │                      productos y pedidos
│   │   └── db/seed.py         Carga idempotente de admin, categorías y productos
│   ├── requirements.txt
│   ├── docker-compose.yml     PostgreSQL local (opcional)
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── features/          auth, categorias, productos, pedidos y usuarios
    │   │                      (cada una con pages, components, hooks, api y types)
    │   ├── shared/            Axios, queryClient, componentes UI y layouts
    │   ├── store/             authStore y cartStore (Zustand con persist)
    │   └── routes/            AppRouter y ProtectedRoute
    ├── package.json
    └── .env.example
```

El backend se organiza por módulos de dominio, cada uno con su cadena Router → Service → Unit of Work → Repository → Model. El commit ocurre solo en el `__exit__` del Unit of Work: ningún Service ni Router llama a `session.commit()`. El frontend se organiza por features que espejan esos módulos.

## Backend

### Instalación y ejecución

Todos los comandos se ejecutan dentro de `backend/`. Si hay varias versiones de Python instaladas, crear el entorno virtual con una de 3.11 a 3.13 (en Windows: `py -3.13 -m venv .venv`).

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

La API queda en `http://localhost:8000/api/v1`, con la documentación en [`/docs`](http://localhost:8000/docs) y [`/redoc`](http://localhost:8000/redoc). Las tablas se crean solas al iniciar el servidor o al correr el seed.

En PowerShell, si `activate` falla por la política de ejecución de scripts, habilitarla solo para la terminal actual con `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` y volver a activar.

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

## Frontend

### Instalación y ejecución

Con el backend corriendo, en otra terminal y dentro de `frontend/`:

```bash
cd frontend

# 1. Dependencias
pnpm install

# 2. Variables de entorno
copy .env.example .env          # Windows
# cp .env.example .env          # Linux / macOS

# 3. Servidor de desarrollo
pnpm dev
```

La aplicación queda en `http://localhost:5173`. `pnpm build` verifica los tipos (TypeScript en modo `strict`) y genera la versión de producción en `dist/`.

El puerto 5173 es fijo porque es el origen que el backend autoriza en CORS (`FRONTEND_ORIGIN`). Si está ocupado, `pnpm dev` termina con un error en lugar de usar otro puerto: hay que liberarlo, o cambiar el puerto en `vite.config.ts` y `FRONTEND_ORIGIN` en `backend/.env`.

### Variables de entorno (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API, con el prefijo `/api/v1`. | `http://localhost:8000/api/v1` |

### Pantallas

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Catálogo paginado en el servidor, con búsqueda, filtro por categoría y «Agregar al carrito» | Público |
| `/login`, `/register` | Inicio de sesión y registro | Público |
| `/carrito` | Carrito con cantidades, subtotales y total; se conserva al recargar | Público |
| `/checkout` | Confirmar el pedido con dirección, forma de pago y notas | Sesión |
| `/mis-pedidos` | Pedidos propios con detalle y cancelación en `PENDIENTE` | Sesión |
| `/admin/resumen` | Tarjetas con los indicadores del negocio | admin |
| `/admin/pedidos` | Pedidos con filtro por estado y botones para avanzar o cancelar | admin |
| `/admin/productos` | ABM de productos con cambio de stock y disponibilidad | admin |
| `/admin/categorias` | ABM de categorías | admin |
| `/admin/usuarios` | Usuarios con activar y desactivar | admin |
| `/unauthorized` | Sin permiso | Público |

Sin sesión, las rutas protegidas redirigen a `/login`; con una sesión sin el rol necesario, a `/unauthorized`.

### Sesión y estado

- La sesión viaja en la cookie HttpOnly `access_token`: el frontend nunca lee ni guarda el token. Axios envía la cookie con `withCredentials: true`.
- `authStore` (Zustand con `persist`) guarda solo los datos del usuario. Al abrir la aplicación, `checkSession` confirma la sesión con `GET /auth/me`.
- `cartStore` (Zustand con `persist`) guarda el carrito en el navegador.
- Un interceptor de Axios limpia la sesión ante un 401, o ante un 400 por cuenta desactivada.
- Los datos del servidor (catálogo, pedidos, usuarios y resumen) se obtienen con TanStack Query, que vuelve a pedirlos después de cada cambio.

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| Errores al instalar las dependencias o al iniciar el servidor con Python 3.14 | SQLModel no soporta 3.14. Crear el entorno virtual con Python 3.11 a 3.13. |
| `ModuleNotFoundError: No module named 'psycopg'` | `DATABASE_URL` empieza con `postgresql://`. Usar `postgresql+psycopg2://`, como en `.env.example`. |
| `docker compose up -d` falla porque el puerto 5432 está en uso | Ya hay un PostgreSQL corriendo. Crear en él la base `foodstore_db` y ajustar usuario y contraseña en `DATABASE_URL`, o detener ese servicio. |
| El login responde bien pero la aplicación vuelve a pedir sesión, o el navegador muestra un error de CORS | El frontend no corre en el origen de `FRONTEND_ORIGIN` (`http://localhost:5173`), o `VITE_API_URL` no apunta al backend. Abrir la aplicación desde `http://localhost:5173`, no desde `127.0.0.1`. |
