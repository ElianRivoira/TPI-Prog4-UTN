import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { productosKeys } from '@/features/productos/hooks/useProductos';

import { cancelarPedido, crearPedido, listarPedidos, obtenerPedido } from '../api/pedidos';
import type { FiltrosPedidos, Pedido, PedidoCreate } from '../types/pedido.types';

export const pedidosKeys = {
  todos: ['pedidos'] as const,
  lista: (filtros: FiltrosPedidos) => ['pedidos', 'lista', filtros] as const,
  detalle: (id: number) => ['pedidos', 'detalle', id] as const,
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
