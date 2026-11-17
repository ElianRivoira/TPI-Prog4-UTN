from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

# --- Excepciones de dominio (el Router las traduce a códigos HTTP) ---


class CategoriaNoEncontrada(Exception):
    def __init__(self, categoria_id: int) -> None:
        super().__init__(f"La categoría {categoria_id} no existe")


class NombreDuplicado(Exception):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"Ya existe una categoría con el nombre '{nombre}'")


def obtener_categoria_activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
    """Una categoría dada de baja se trata como inexistente."""
    categoria = uow.categorias.get_by_id(categoria_id)
    if categoria is None or not categoria.activo:
        raise CategoriaNoEncontrada(categoria_id)
    return categoria


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(obtener_categoria_activa(uow, categoria_id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            # El nombre sigue ocupado aunque la categoría que lo usa esté dada de baja
            if uow.categorias.get_by_nombre(data.nombre) is not None:
                raise NombreDuplicado(data.nombre)
            categoria = uow.categorias.add(Categoria.model_validate(data))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = obtener_categoria_activa(uow, categoria_id)
            cambios = data.model_dump(exclude_unset=True, exclude_none=True)

            if "nombre" in cambios:
                existente = uow.categorias.get_by_nombre(cambios["nombre"])
                if existente is not None and existente.id != categoria.id:
                    raise NombreDuplicado(cambios["nombre"])

            categoria.sqlmodel_update(cambios)
            categoria = uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica. No libera el nombre ni da de baja los productos de la categoría."""
        with self.uow as uow:
            categoria = obtener_categoria_activa(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)
