import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  actualizarProducto,
  actualizarStock,
  crearProducto,
  eliminarProducto,
  listarProductos,
} from '../api/productos';
import type {
  FiltrosProductos,
  ProductoCreate,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types/producto.types';

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

/** Cualquier cambio en un producto afecta al catálogo y a la tabla del panel. */
function useInvalidarProductos() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: productosKeys.todos });
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: (datos: ProductoCreate) => crearProducto(datos),
    onSuccess: invalidar,
  });
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoUpdate }) => actualizarProducto(id, datos),
    onSuccess: invalidar,
  });
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoStockUpdate }) => actualizarStock(id, datos),
    onSuccess: invalidar,
  });
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: (id: number) => eliminarProducto(id),
    // También tras un 404: el producto ya no estaba y la tabla tiene que reflejarlo
    onSettled: invalidar,
  });
}
