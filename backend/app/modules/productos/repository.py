from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        *,
        skip: int,
        limit: int,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[list[Producto], int]:
        """Productos activos filtrados y paginados. Devuelve la página pedida y el total sin paginar."""
        filtros = [col(Producto.activo).is_(True)]
        if search:
            # ilike: búsqueda por nombre sin distinguir mayúsculas
            filtros.append(col(Producto.nombre).ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        consulta = (
            select(Producto)
            .where(*filtros)
            # Carga las categorías en una sola consulta extra, en lugar de una por producto
            .options(selectinload(Producto.categoria))  # type: ignore[arg-type]
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )
        return list(self.session.exec(consulta).all()), total

    def get_by_nombre(self, nombre: str) -> Producto | None:
        """Busca por nombre exacto. Lo usa el seed para no duplicar productos."""
        return self.session.exec(select(Producto).where(Producto.nombre == nombre)).first()
