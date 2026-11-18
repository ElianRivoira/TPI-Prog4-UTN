from datetime import datetime

from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def get_for_update(self, pedido_id: int) -> Pedido | None:
        """Obtiene el pedido bloqueando su fila hasta el fin de la transacción (SELECT ... FOR UPDATE).

        Evita que dos cambios de estado simultáneos sobre el mismo pedido (por ejemplo, dos
        cancelaciones) restituyan el stock dos veces.
        """
        consulta = select(Pedido).where(Pedido.id == pedido_id).with_for_update()
        return self.session.exec(consulta).first()

    def list_by_usuario(
        self,
        usuario_id: int | None,
        *,
        skip: int,
        limit: int,
        estado: str | None = None,
    ) -> tuple[list[Pedido], int]:
        """Pedidos de un usuario (o de todos si usuario_id es None), del más nuevo al más viejo."""
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)

        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        consulta = (
            select(Pedido)
            .where(*filtros)
            # Carga las líneas de todos los pedidos de la página en una sola consulta extra
            .options(selectinload(Pedido.items))  # type: ignore[arg-type]
            .order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        )
        return list(self.session.exec(consulta).all()), total

    def count_by_estado(self) -> dict[str, int]:
        consulta = select(Pedido.estado, func.count()).group_by(Pedido.estado)
        return {estado: cantidad for estado, cantidad in self.session.exec(consulta).all()}

    def count_creados_desde(self, desde: datetime) -> int:
        consulta = select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        return self.session.exec(consulta).one()

    def sum_total_por_estado(self, estado: str) -> float:
        consulta = select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)
        return float(self.session.exec(consulta).one())
