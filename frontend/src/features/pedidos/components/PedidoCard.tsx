import { BadgeEstado } from '@/shared/ui/BadgeEstado';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato';

import type { Pedido } from '../types/pedido.types';

interface PedidoCardProps {
  pedido: Pedido;
  puedeCancelar: boolean;
  onVerDetalle: () => void;
  onCancelar: () => void;
}

export function PedidoCard({ pedido, puedeCancelar, onVerDetalle, onCancelar }: PedidoCardProps) {
  const unidades = pedido.items.reduce((suma, i) => suma + i.cantidad, 0);

  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-900">Pedido #{pedido.id}</span>
          <BadgeEstado estado={pedido.estado} />
        </div>
        <span className="text-sm text-slate-500">
          {formatearFecha(pedido.created_at)} · {unidades} {unidades === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span className="text-lg font-bold text-slate-900">{formatearPrecio(pedido.total)}</span>
        <div className="flex gap-2">
          <Button variante="secundario" tamano="sm" onClick={onVerDetalle}>
            Ver detalle
          </Button>
          {puedeCancelar && (
            <Button variante="peligro" tamano="sm" onClick={onCancelar}>
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
