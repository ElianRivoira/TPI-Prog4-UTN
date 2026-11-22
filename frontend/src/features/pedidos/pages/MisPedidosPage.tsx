import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/store/authStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { EstadoError } from '@/shared/components/EstadoError';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { Paginacion } from '@/shared/components/Paginacion';
import { Skeleton } from '@/shared/components/Skeleton';
import { Alerta } from '@/shared/ui/Alerta';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/ui/cn';
import { Modal } from '@/shared/ui/Modal';

import { DetallePedidoModal } from '../components/DetallePedidoModal';
import { PedidoCard } from '../components/PedidoCard';
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos';
import type { Pedido } from '../types/pedido.types';

const LIMIT = 10;

export function MisPedidosPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const location = useLocation();
  const pedidoCreado = (location.state as { pedidoCreado?: number } | null)?.pedidoCreado;

  const [pagina, setPagina] = useState(0);
  const [enDetalle, setEnDetalle] = useState<Pedido | null>(null);
  const [aCancelar, setACancelar] = useState<Pedido | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const pedidos = usePedidos({ skip: pagina * LIMIT, limit: LIMIT });
  const cancelar = useCancelarPedido();

  // Solo el dueño cancela, y solo en PENDIENTE (el admin usa el cambio de estado del panel)
  const puedeCancelar = (p: Pedido) => p.estado === 'PENDIENTE' && p.usuario_id === usuario?.id;

  async function confirmarCancelacion() {
    if (!aCancelar) return;
    const id = aCancelar.id;
    try {
      await cancelar.mutateAsync(id);
      setMensaje({ tipo: 'exito', texto: `El pedido #${id} se canceló y el stock se restituyó.` });
    } catch (error) {
      // 400 si dejó de estar PENDIENTE (por ejemplo, el local ya lo empezó a preparar)
      setMensaje({ tipo: 'error', texto: handleApiError(error) });
    } finally {
      setACancelar(null);
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Mis pedidos</h1>

      {pedidoCreado !== undefined && !mensaje && (
        <Alerta tipo="exito">¡Listo! Recibimos tu pedido #{pedidoCreado}.</Alerta>
      )}
      {mensaje && <Alerta tipo={mensaje.tipo}>{mensaje.texto}</Alerta>}

      {pedidos.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : pedidos.isError ? (
        <EstadoError mensaje={handleApiError(pedidos.error)} onReintentar={() => void pedidos.refetch()} />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hiciste pedidos"
          accion={
            <Link to="/" className="text-sm font-medium text-orange-600 hover:text-orange-700">
              Ir al catálogo
            </Link>
          }
        />
      ) : (
        <>
          <ul className={cn('flex flex-col gap-3', pedidos.isPlaceholderData && 'opacity-60')}>
            {pedidos.data.items.map((p) => (
              <li key={p.id}>
                <PedidoCard
                  pedido={p}
                  puedeCancelar={puedeCancelar(p)}
                  onVerDetalle={() => setEnDetalle(p)}
                  onCancelar={() => setACancelar(p)}
                />
              </li>
            ))}
          </ul>
          <Paginacion pagina={pagina} total={pedidos.data.total} limit={LIMIT} onCambiar={setPagina} />
        </>
      )}

      {enDetalle && <DetallePedidoModal pedido={enDetalle} onCerrar={() => setEnDetalle(null)} />}

      <Modal
        abierto={aCancelar !== null}
        titulo={`Cancelar pedido #${aCancelar?.id ?? ''}`}
        onCerrar={() => setACancelar(null)}
      >
        <p className="text-sm text-slate-600">
          El pedido se cancela y los productos vuelven al stock. Esta acción no se puede deshacer.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variante="secundario" onClick={() => setACancelar(null)}>
            Volver
          </Button>
          <Button
            variante="peligro"
            cargando={cancelar.isPending}
            onClick={() => void confirmarCancelacion()}
          >
            Cancelar pedido
          </Button>
        </div>
      </Modal>
    </section>
  );
}
