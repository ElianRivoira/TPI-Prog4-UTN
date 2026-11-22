import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { handleApiError } from '@/shared/api/handleApiError';
import { EstadoError } from '@/shared/components/EstadoError';
import { TablaDatos, TablaDatosSkeleton } from '@/shared/components/TablaDatos';
import { useTablaCliente } from '@/shared/hooks/useTablaCliente';
import { Alerta } from '@/shared/ui/Alerta';
import { BadgeEstado } from '@/shared/ui/BadgeEstado';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { Select } from '@/shared/ui/Select';
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato';

import { DetallePedidoModal } from '../components/DetallePedidoModal';
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos';
import type { EstadoPedido, Pedido } from '../types/pedido.types';
import { ESTADOS_PEDIDO, esCancelablePorAdmin, siguienteEstado } from '../utils/maquinaEstados';

// Hasta 100 pedidos por estado (el máximo de la API); la tabla los pagina en el cliente
const LIMIT_PANEL = 100;
const SIN_PEDIDOS: Pedido[] = [];
const columna = createColumnHelper<Pedido>();

type Mensaje = { tipo: 'exito' | 'error'; texto: string };

export function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined);
  const pedidos = usePedidos({ skip: 0, limit: LIMIT_PANEL, estado });
  const cambiarEstado = useCambiarEstadoPedido();

  const [enDetalle, setEnDetalle] = useState<Pedido | null>(null);
  const [aCancelar, setACancelar] = useState<Pedido | null>(null);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);

  /** Pedido cuyo cambio de estado está en curso, para mostrar el botón cargando solo en su fila. */
  const enCurso = cambiarEstado.isPending ? cambiarEstado.variables.id : null;

  const columnas = useMemo(() => {
    async function avanzar(pedido: Pedido, nuevo: EstadoPedido) {
      try {
        await cambiarEstado.mutateAsync({ id: pedido.id, estado: nuevo });
        setMensaje({
          tipo: 'exito',
          texto: `El pedido #${pedido.id} pasó a ${nuevo === 'ENTREGADO' ? 'entregado' : 'en preparación'}.`,
        });
      } catch (error) {
        // 400 si otro admin ya lo cambió: la tabla se refresca igual (onSettled)
        setMensaje({ tipo: 'error', texto: handleApiError(error) });
      }
    }

    return [
      columna.accessor('id', {
        header: 'Pedido',
        cell: (info) => <span className="font-medium text-slate-900">#{info.getValue()}</span>,
      }),
      columna.accessor('created_at', {
        header: 'Fecha',
        cell: (info) => <span className="whitespace-nowrap">{formatearFecha(info.getValue())}</span>,
      }),
      columna.accessor('usuario_id', {
        header: 'Cliente',
        cell: (info) => <span className="text-slate-600">Usuario #{info.getValue()}</span>,
      }),
      columna.accessor('estado', {
        header: 'Estado',
        cell: (info) => <BadgeEstado estado={info.getValue()} />,
      }),
      columna.accessor('total', {
        header: 'Total',
        cell: (info) => <span className="font-medium">{formatearPrecio(info.getValue())}</span>,
      }),
      columna.display({
        id: 'acciones',
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => {
          const pedido = row.original;
          const siguiente = siguienteEstado(pedido.estado);
          return (
            <div className="flex justify-end gap-2">
              <Button variante="fantasma" tamano="sm" onClick={() => setEnDetalle(pedido)}>
                Detalle
              </Button>
              {siguiente && (
                <Button
                  tamano="sm"
                  cargando={enCurso === pedido.id}
                  disabled={enCurso !== null}
                  onClick={() => void avanzar(pedido, siguiente.estado)}
                >
                  {siguiente.accion}
                </Button>
              )}
              {esCancelablePorAdmin(pedido.estado) && (
                <Button
                  variante="peligro"
                  tamano="sm"
                  disabled={enCurso !== null}
                  onClick={() => setACancelar(pedido)}
                >
                  Cancelar
                </Button>
              )}
            </div>
          );
        },
      }),
    ];
    // mutateAsync y los setters de useState son estables; las columnas cambian con la fila en curso
  }, [enCurso]);

  const { tabla } = useTablaCliente(pedidos.data?.items ?? SIN_PEDIDOS, columnas);

  async function confirmarCancelacion() {
    if (!aCancelar) return;
    const id = aCancelar.id;
    try {
      await cambiarEstado.mutateAsync({ id, estado: 'CANCELADO' });
      setMensaje({ tipo: 'exito', texto: `El pedido #${id} se canceló y el stock se restituyó.` });
    } catch (error) {
      setMensaje({ tipo: 'error', texto: handleApiError(error) });
    } finally {
      setACancelar(null);
    }
  }

  const total = pedidos.data?.total ?? 0;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>
        <div className="sm:w-56">
          <Select
            label="Estado"
            value={estado ?? ''}
            onChange={(e) => {
              setEstado(e.target.value ? (e.target.value as EstadoPedido) : undefined);
              tabla.setPageIndex(0);
            }}
          >
            <option value="">Todos</option>
            {ESTADOS_PEDIDO.map((e) => (
              <option key={e.valor} value={e.valor}>
                {e.etiqueta}
              </option>
            ))}
          </Select>
        </div>
      </header>

      {mensaje && <Alerta tipo={mensaje.tipo}>{mensaje.texto}</Alerta>}
      {total > LIMIT_PANEL && (
        <Alerta tipo="info">
          Se muestran los {LIMIT_PANEL} pedidos más recientes de {total}. Filtrá por estado para ver otros.
        </Alerta>
      )}

      {pedidos.isPending ? (
        <TablaDatosSkeleton />
      ) : pedidos.isError ? (
        <EstadoError mensaje={handleApiError(pedidos.error)} onReintentar={() => void pedidos.refetch()} />
      ) : (
        <TablaDatos
          tabla={tabla}
          actualizando={pedidos.isFetching}
          mensajeVacio={estado ? 'No hay pedidos en este estado.' : 'Todavía no hay pedidos.'}
        />
      )}

      {enDetalle && <DetallePedidoModal pedido={enDetalle} onCerrar={() => setEnDetalle(null)} />}

      <Modal
        abierto={aCancelar !== null}
        titulo={`Cancelar pedido #${aCancelar?.id ?? ''}`}
        onCerrar={() => setACancelar(null)}
      >
        <p className="text-sm text-slate-600">
          El pedido pasa a cancelado y los productos vuelven al stock. Esta acción no se puede deshacer.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variante="secundario" onClick={() => setACancelar(null)}>
            Volver
          </Button>
          <Button
            variante="peligro"
            cargando={cambiarEstado.isPending}
            onClick={() => void confirmarCancelacion()}
          >
            Cancelar pedido
          </Button>
        </div>
      </Modal>
    </section>
  );
}
