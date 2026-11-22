import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { productosKeys } from '@/features/productos/hooks/useProductos';

import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  listarPedidos,
  obtenerPedido,
  obtenerResumen,
} from '../api/pedidos';
import type { EstadoPedido, FiltrosPedidos, Pedido, PedidoCreate } from '../types/pedido.types';

// Todas cuelgan de ['pedidos']: invalidar `todos` refresca listas, detalles y el resumen
export const pedidosKeys = {
  todos: ['pedidos'] as const,
  lista: (filtros: FiltrosPedidos) => ['pedidos', 'lista', filtros] as const,
  detalle: (id: number) => ['pedidos', 'detalle', id] as const,
  resumen: ['pedidos', 'resumen'] as const,
};

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: pedidosKeys.lista(filtros),
    queryFn: () => listarPedidos(filtros),
    placeholderData: keepPreviousData,
  });
}

/** Detalle de un pedido. `inicial` (el pedido de la lista) se muestra mientras llega la respuesta. */
export function usePedido(id: number, inicial?: Pedido) {
  return useQuery({
    queryKey: pedidosKeys.detalle(id),
    queryFn: () => obtenerPedido(id),
    placeholderData: inicial,
  });
}

/** Indicadores del panel de administración. */
export function useResumenPedidos() {
  return useQuery({
    queryKey: pedidosKeys.resumen,
    queryFn: obtenerResumen,
  });
}

/**
 * Después de crear o cancelar cambian los pedidos y el stock: se invalidan ambos. También tras un
 * error (onSettled): un 400 suele indicar que los datos en pantalla quedaron viejos.
 */
function useInvalidarPedidosYStock() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: pedidosKeys.todos });
    void queryClient.invalidateQueries({ queryKey: productosKeys.todos });
  };
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidosYStock();
  return useMutation({
    mutationFn: (datos: PedidoCreate) => crearPedido(datos),
    onSettled: invalidar,
  });
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidosYStock();
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSettled: invalidar,
  });
}

/** Cambio de estado por el admin. Cancelar restituye stock: se invalidan pedidos, resumen y productos. */
export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidosYStock();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSettled: invalidar,
  });
}
