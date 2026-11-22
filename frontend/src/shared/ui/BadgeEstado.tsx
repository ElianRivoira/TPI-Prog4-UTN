import type { EstadoPedido } from '@/features/pedidos/types/pedido.types';

import { cn } from './cn';

const estilos: Record<EstadoPedido, { etiqueta: string; clases: string }> = {
  PENDIENTE: { etiqueta: 'Pendiente', clases: 'bg-amber-100 text-amber-800' },
  EN_PREPARACION: { etiqueta: 'En preparación', clases: 'bg-sky-100 text-sky-800' },
  ENTREGADO: { etiqueta: 'Entregado', clases: 'bg-emerald-100 text-emerald-800' },
  CANCELADO: { etiqueta: 'Cancelado', clases: 'bg-slate-200 text-slate-700' },
};

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const { etiqueta, clases } = estilos[estado];
  return (
    <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold', clases)}>
      {etiqueta}
    </span>
  );
}
