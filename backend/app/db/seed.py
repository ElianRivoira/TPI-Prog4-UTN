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
    {"nombre": "Pizzas", "descripcion": "Pizzas a la piedra"},
    {"nombre": "Hamburguesas", "descripcion": "Hamburguesas con papas fritas"},
    {"nombre": "Bebidas", "descripcion": "Gaseosas, aguas y cervezas"},
    {"nombre": "Postres", "descripcion": "Postres caseros"},
]

# (categoría, nombre, descripción, precio, stock)
PRODUCTOS: list[tuple[str, str, str, float, int]] = [
    ("Pizzas", "Pizza Muzzarella", "Salsa de tomate, muzzarella y aceitunas", 8500, 30),
    ("Pizzas", "Pizza Napolitana", "Muzzarella, tomate en rodajas y ajo", 9500, 25),
    ("Pizzas", "Pizza Fugazzeta", "Muzzarella y cebolla", 9000, 20),
    ("Hamburguesas", "Hamburguesa Clásica", "Carne, lechuga, tomate y queso", 7500, 40),
    ("Hamburguesas", "Hamburguesa Doble Cheddar", "Doble carne, cheddar y panceta", 9800, 30),
    ("Hamburguesas", "Hamburguesa Veggie", "Medallón de lentejas y vegetales", 8200, 15),
    ("Bebidas", "Gaseosa 500 ml", "Línea Coca-Cola", 1800, 100),
    ("Bebidas", "Agua mineral 500 ml", "Con o sin gas", 1200, 100),
    ("Bebidas", "Cerveza artesanal 473 ml", "IPA o rubia", 3500, 50),
    ("Postres", "Flan con dulce de leche", "Flan casero", 3200, 20),
    ("Postres", "Brownie con helado", "Brownie tibio con helado de crema", 4500, 15),
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

        for nombre_categoria, nombre, descripcion, precio, stock in PRODUCTOS:
            if uow.productos.get_by_nombre(nombre) is None:
                uow.productos.add(
                    Producto(
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
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
