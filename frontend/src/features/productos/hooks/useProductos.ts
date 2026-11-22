import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { listarProductos } from '../api/productos';
import type { FiltrosProductos } from '../types/producto.types';

export const productosKeys = {
  todos: ['productos'] as const,
  lista: (filtros: FiltrosProductos) => ['productos', filtros] as const,
};

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: productosKeys.lista(filtros),
    queryFn: () => listarProductos(filtros),
    // Al cambiar de página se mantiene la anterior en pantalla hasta que llega la nueva
    placeholderData: keepPreviousData,
  });
}
