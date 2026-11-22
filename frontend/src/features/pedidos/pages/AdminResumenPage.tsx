import { handleApiError } from '@/shared/api/handleApiError';
import { EstadoError } from '@/shared/components/EstadoError';
import { Skeleton } from '@/shared/components/Skeleton';
import { formatearPrecio } from '@/shared/utils/formato';

import { TarjetaResumen, type Tono } from '../components/TarjetaResumen';
import { useResumenPedidos } from '../hooks/usePedidos';
import type { ResumenPedidos } from '../types/pedido.types';

interface Indicador {
  titulo: string;
  valor: string;
  tono: Tono;
  detalle?: string;
}

function indicadores(r: ResumenPedidos): Indicador[] {
  return [
    { titulo: 'Pedidos de hoy', valor: String(r.pedidos_hoy), tono: 'naranja', detalle: 'Creados desde las 00:00' },
    {
      titulo: 'Ingresos',
      valor: formatearPrecio(r.ingresos_entregados),
      tono: 'esmeralda',
      detalle: 'Suma de los pedidos entregados',
    },
    { titulo: 'Pendientes', valor: String(r.pendientes), tono: 'ambar', detalle: 'Esperan que el local los tome' },
    { titulo: 'En preparación', valor: String(r.en_preparacion), tono: 'cielo' },
    { titulo: 'Entregados', valor: String(r.entregados), tono: 'esmeralda' },
    { titulo: 'Cancelados', valor: String(r.cancelados), tono: 'pizarra' },
  ];
}

export function AdminResumenPage() {
  const resumen = useResumenPedidos();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Resumen</h1>

      {resumen.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : resumen.isError ? (
        <EstadoError mensaje={handleApiError(resumen.error)} onReintentar={() => void resumen.refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {indicadores(resumen.data).map((i) => (
            <TarjetaResumen key={i.titulo} {...i} />
          ))}
        </div>
      )}
    </section>
  );
}
