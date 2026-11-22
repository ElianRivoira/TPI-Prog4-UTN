import { handleApiError } from '@/shared/api/handleApiError';
import { EstadoError } from '@/shared/components/EstadoError';
import { Skeleton } from '@/shared/components/Skeleton';
import { Modal } from '@/shared/ui/Modal';

import { usePedido } from '../hooks/usePedidos';
import type { Pedido } from '../types/pedido.types';
import { DetallePedido } from './DetallePedido';

interface DetallePedidoModalProps {
  pedido: Pedido;
  onCerrar: () => void;
}

export function DetallePedidoModal({ pedido, onCerrar }: DetallePedidoModalProps) {
  // Pide el detalle actualizado; mientras tanto muestra el pedido que ya trajo la lista
  const detalle = usePedido(pedido.id, pedido);

  return (
    <Modal abierto titulo={`Pedido #${pedido.id}`} onCerrar={onCerrar}>
      {detalle.data ? (
        <DetallePedido pedido={detalle.data} />
      ) : detalle.isError ? (
        <EstadoError mensaje={handleApiError(detalle.error)} onReintentar={() => void detalle.refetch()} />
      ) : (
        <Skeleton className="h-40 w-full" />
      )}
    </Modal>
  );
}
