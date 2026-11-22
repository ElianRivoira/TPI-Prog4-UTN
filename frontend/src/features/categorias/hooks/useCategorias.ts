import { useQuery } from '@tanstack/react-query';

import { listarCategorias } from '../api/categorias';

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
