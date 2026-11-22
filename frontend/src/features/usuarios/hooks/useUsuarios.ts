import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { activarUsuario, desactivarUsuario, listarUsuarios } from '../api/usuarios';

export const usuariosKeys = {
  todos: ['usuarios'] as const,
};

export function useUsuarios() {
  return useQuery({
    queryKey: usuariosKeys.todos,
    queryFn: listarUsuarios,
  });
}

/** Tras activar o desactivar (o ante un error, por si la lista quedó vieja) se vuelve a pedir la lista. */
function useInvalidarUsuarios() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: usuariosKeys.todos });
}

export function useActivarUsuario() {
  const invalidar = useInvalidarUsuarios();
  return useMutation({
    mutationFn: (id: number) => activarUsuario(id),
    onSettled: invalidar,
  });
}

export function useDesactivarUsuario() {
  const invalidar = useInvalidarUsuarios();
  return useMutation({
    mutationFn: (id: number) => desactivarUsuario(id),
    onSettled: invalidar,
  });
}
