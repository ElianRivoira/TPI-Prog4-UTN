import { useMutation, useQueryClient } from '@tanstack/react-query';

import { productosKeys } from '@/features/productos/hooks/useProductos';

import { crearPedido } from '../api/pedidos';
import type { PedidoCreate } from '../types/pedido.types';

export const pedidosKeys = {
  todos: ['pedidos'] as const,
};

export function useCrearPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: PedidoCreate) => crearPedido(datos),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pedidosKeys.todos });
      // El pedido descontó stock: el catálogo tiene que volver a pedirse
      void queryClient.invalidateQueries({ queryKey: productosKeys.todos });
    },
  });
}
