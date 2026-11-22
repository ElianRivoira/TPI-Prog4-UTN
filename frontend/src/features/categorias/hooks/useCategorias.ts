import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { productosKeys } from '@/features/productos/hooks/useProductos';

import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
} from '../api/categorias';
import type { CategoriaCreate, CategoriaUpdate } from '../types/categoria.types';

export const categoriasKeys = {
  todas: ['categorias'] as const,
};

export function useCategorias() {
  return useQuery({
    queryKey: categoriasKeys.todas,
    queryFn: listarCategorias,
    // Cambian poco: se reutilizan entre pantallas sin volver a pedirlas
    staleTime: 5 * 60_000,
  });
}

/** Los productos muestran el nombre de su categoría: al cambiar una categoría se invalidan ambos. */
function useInvalidarCategorias() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: categoriasKeys.todas });
    void queryClient.invalidateQueries({ queryKey: productosKeys.todos });
  };
}

export function useCrearCategoria() {
  const invalidar = useInvalidarCategorias();
  return useMutation({
    mutationFn: (datos: CategoriaCreate) => crearCategoria(datos),
    onSuccess: invalidar,
  });
}

export function useActualizarCategoria() {
  const invalidar = useInvalidarCategorias();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaUpdate }) => actualizarCategoria(id, datos),
    onSuccess: invalidar,
  });
}

export function useEliminarCategoria() {
  const invalidar = useInvalidarCategorias();
  return useMutation({
    mutationFn: (id: number) => eliminarCategoria(id),
    // También tras un 404: la categoría ya no estaba y la tabla tiene que reflejarlo
    onSettled: invalidar,
  });
}
