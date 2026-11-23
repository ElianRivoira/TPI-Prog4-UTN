"""Carga los datos iniciales. Es idempotente: se puede correr varias veces sin duplicar nada.

Uso (desde backend/):  python -m app.db.seed
"""

from app.core.database import create_all_tables
from app.core.security import hash_password
from app.db import models as _models  # noqa: F401  (registra las tablas antes de crearlas)
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

# Usuario administrador inicial (credenciales de desarrollo documentadas en el README)
ADMIN = {
    "username": "admin",
    "full_name": "Administrador",
    "email": "admin@foodstore.com",
    "password": "Admin1234!",
}

CATEGORIAS: list[dict[str, str]] = [
    {"nombre": "Hamburguesas", "descripcion": "Hamburguesas artesanales con carne premium"},
    {"nombre": "Pizzas", "descripcion": "Pizzas al horno de barro"},
    {"nombre": "Empanadas", "descripcion": "Empanadas caseras horneadas"},
    {"nombre": "Bebidas", "descripcion": "Bebidas frías y calientes"},
    {"nombre": "Papas Fritas", "descripcion": "Acompañamientos crujientes"},
]

# (categoría, nombre, descripción, precio, stock, imagen_url)
# Las imágenes son URLs públicas (Unsplash y otras); si alguna no carga, el frontend muestra la
# inicial del producto en su lugar.
PRODUCTOS: list[tuple[str, str, str, float, int, str]] = [
    (
        "Hamburguesas",
        "Hamburguesa Clásica",
        "Carne 150g, lechuga, tomate, cebolla morada y mayonesa",
        4500,
        50,
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    ),
    (
        "Hamburguesas",
        "Hamburguesa Doble",
        "Doble carne 150g c/u, cheddar, panceta y salsa barbacoa",
        6200,
        40,
        "https://images.unsplash.com/photo-1550317138-10000687a72b?w=500",
    ),
    (
        "Hamburguesas",
        "Hamburguesa Completa",
        "Carne 150g, huevo, jamón, queso, lechuga y tomate",
        5500,
        30,
        "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500",
    ),
    (
        "Hamburguesas",
        "Hamburguesa Veggie",
        "Medallón de lentejas y quinoa, rúcula, tomate confitado y hummus",
        5000,
        20,
        "https://imgs.search.brave.com/vUU8kRyBw8UOoDFUuZja2znED53OJK7yhKK0fOgySrg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/aG9sYS5jb20vaG9y/aXpvbi9sYW5kc2Nh/cGUvNWYyY2RlMjUz/ODExLWhhbWJ1cmd1/ZXNhcy12ZWdnaWVz/LXQuanBnP2ltPVJl/c2l6ZT0oNjQwKSx0/eXBlPWRvd25zaXpl",
    ),
    (
        "Pizzas",
        "Pizza Mozzarella",
        "Mozzarella, salsa de tomate y orégano",
        3800,
        25,
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
    ),
    (
        "Pizzas",
        "Pizza Napolitana",
        "Mozzarella, rodajas de tomate, ajo, aceitunas y albahaca",
        4500,
        25,
        "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500",
    ),
    (
        "Pizzas",
        "Pizza Fugazzeta",
        "Mozzarella, cebolla caramelizada, jamón y aceitunas",
        4800,
        20,
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500",
    ),
    (
        "Pizzas",
        "Pizza Especial",
        "Mozzarella, pepperoni, morrón, cebolla, huevo y aceitunas",
        5200,
        15,
        "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500",
    ),
    (
        "Empanadas",
        "Empanada de Carne",
        "Carne picada, cebolla, huevo duro, aceitunas y especias",
        1200,
        100,
        "https://imgs.search.brave.com/59eMoaWJDRojEIbZWP0bDyOXFyd-uZ67f1Od9J5OdJo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/LmJvbnZpdmV1ci5j/b20vZW1wYW5hZGFz/LWFyZ2VudGluYXMt/ZGUtY2FybmUtZm90/by1jZXJjYS5qcGc",
    ),
    (
        "Empanadas",
        "Empanada de Pollo",
        "Pollo desmenuzado, cebolla, morrón y crema",
        1200,
        80,
        "https://imgs.search.brave.com/rzKU68f-NWlQMA1gEaSdY5ToiVPImNEDEeyt91Mu3V8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/c3VwZXJwb2xsby5j/bC9pbWcvcmVjZXRh/cy9lbXBhbmFkYXMt/ZGUtcG9sbG8ud2Vi/cA",
    ),
    (
        "Empanadas",
        "Empanada Jamón y Queso",
        "Jamón cocido y mozzarella",
        1100,
        90,
        "https://imgs.search.brave.com/7oHPZkFZ8_QQGTD7jyuHPv22MkZ0XOCuew9a7chmD3g/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucmFwcGkuY29t/LmFyL3Byb2R1Y3Rz/L2Y1MWFiMWI4LTdh/MzUtNGZkZi1hYWRm/LWQyNmJmYjcyYTRk/NS5wbmc_ZD0zMDB4/MzAwJmU9d2VicCZx/PTEw",
    ),
    (
        "Empanadas",
        "Empanada de Verdura",
        "Espinaca, acelga, ricota y nuez moscada",
        1100,
        60,
        "https://imgs.search.brave.com/CFN-cLWHvGEPaFwXsHGF1B06YLGa6dL6reSjESWoM1w/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9yZWNl/dGFzbmF0dXJhLmNv/bS5hci9zaXRlcy9y/ZWNldGFzbmF0dXJh/L2ZpbGVzL25hdHVy/YS1mb3Rvcy13ZWIt/ZW5lcm8tNjU1eDQ3/NWVtcGFuYWRhc19k/ZV92ZXJkdXJhLmpw/Zw",
    ),
    (
        "Bebidas",
        "Coca-Cola 500ml",
        "Gaseosa Coca-Cola original 500ml",
        1500,
        200,
        "https://imgs.search.brave.com/mpy_eqy5amQNhruIs_nGxxc5r3OB_e72krEXhJoEY1M/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/dmlhdHJlbnRvLmNv/bS5hci90aHVtYi8w/MDAwMDAwMDAwMDAx/MDY5NTUwMjI1NUEw/NkIzNC0yNjQ0LTRG/ODQtOUZFOS1DMDEz/RjQxMjA5N0EtMS0y/MDEtYV84MDB4ODAw/LmpwZWc",
    ),
    (
        "Bebidas",
        "Sprite 500ml",
        "Gaseosa Sprite 500ml",
        1500,
        180,
        "https://imgs.search.brave.com/A1KRBI3zvXKrym5ebbQizCZ8t2IdCKJF2fxiAastZ1A/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9odHRw/Mi5tbHN0YXRpYy5j/b20vRF9RX05QXzJY/XzcxMTMzNi1NTEE4/OTE0OTYxOTU0M18w/ODIwMjUtVi53ZWJw",
    ),
    (
        "Bebidas",
        "Agua Mineral 500ml",
        "Agua mineral sin gas 500ml",
        1000,
        300,
        "https://dispandistribuidora.agilecdn.com.br/8211_1.jpg?v=338-3114143016",
    ),
    (
        "Bebidas",
        "Cerveza Artesanal 473ml",
        "Cerveza artesanal rubia 473ml",
        2500,
        100,
        "https://imgs.search.brave.com/SpDJCdalR7edohOLzhzqCCD0Qbaz5l-BC07in3yPWXY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9pZGVu/dGlmaWNhY2klQzMl/QjNuLW9zY3VyYS1k/ZS1sYS1jZXJ2ZXph/LWRlbC1hcnRlLWVs/LXZpZHJpby00NDA1/MzcyMC5qcGc",
    ),
    (
        "Papas Fritas",
        "Papas Fritas Clásicas",
        "Papas fritas bastón crocantes con sal parrillera",
        2500,
        70,
        "https://imgs.search.brave.com/in2PgvEBAwflH6lKfKgmkhjM5zsAZt_5CCF9WkXKB1Y/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzc0LzE4LzIw/LzM2MF9GXzM3NDE4/MjA3N19oS3ZLS2pL/YW5JZkFacW4wSzhV/WUE3M2FIejZGTXo5/dC5qcGc",
    ),
    (
        "Papas Fritas",
        "Papas con Cheddar y Panceta",
        "Papas fritas bañadas en cheddar y panceta crocante",
        3500,
        50,
        "https://imgs.search.brave.com/tK-SyeGMUaiGUWpfNv8IlBMG7CDpcdQyFoF9zzxS3Os/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tb3Jp/eGUuY29tLmFyL2Zp/bGVzL3JlY2V0YXMv/dGh1bWJzL3BhcGFz/Y2hlZGRhcm1vcml4/ZTAyLmpwZw",
    ),
    (
        "Papas Fritas",
        "Aros de Cebolla",
        "Aros de cebolla empanizados, servidos con salsa barbacoa",
        2800,
        40,
        "https://imgs.search.brave.com/MbIsq2iRx49GR24H-kWPDldGSqyiU7O9Xzc1JGEw0_Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Y2xhcmluLmNvbS9p/bWcvMTk2OS8xMi8z/MS9Ia1JQTEdKRWxf/MTI1Nng2MjBfXzEu/anBnIzE1ODQxMTM5/ODY3NDM",
    ),
]


def seed() -> None:
    create_all_tables()
    categorias_creadas = productos_creados = 0
    admin_creado = False

    with UsuarioUnitOfWork() as uow:
        # Si el admin ya existe no se modifica (tampoco su contraseña)
        if uow.usuarios.get_by_username(ADMIN["username"]) is None:
            uow.usuarios.add(
                Usuario(
                    username=ADMIN["username"],
                    full_name=ADMIN["full_name"],
                    email=ADMIN["email"],
                    hashed_password=hash_password(ADMIN["password"]),
                    role="admin",
                )
            )
            admin_creado = True

    with ProductoUnitOfWork() as uow:
        categorias: dict[str, Categoria] = {}
        for datos in CATEGORIAS:
            categoria = uow.categorias.get_by_nombre(datos["nombre"])
            if categoria is None:
                categoria = uow.categorias.add(Categoria(**datos))
                categorias_creadas += 1
            categorias[datos["nombre"]] = categoria

        for nombre_categoria, nombre, descripcion, precio, stock, imagen_url in PRODUCTOS:
            if uow.productos.get_by_nombre(nombre) is None:
                uow.productos.add(
                    Producto(
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                        imagen_url=imagen_url,
                        categoria_id=categorias[nombre_categoria].id,
                    )
                )
                productos_creados += 1

    print(
        f"Seed completo: admin {'creado' if admin_creado else 'ya existente'}, "
        f"{categorias_creadas} categorías y {productos_creados} productos nuevos."
    )


if __name__ == "__main__":
    seed()
