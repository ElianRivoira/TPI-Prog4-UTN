import { useMutation } from '@tanstack/react-query';

import { registrarUsuario } from '../api/auth';
import type { RegistroInput } from '../types/auth.types';

export function useRegistro() {
  return useMutation({
    mutationFn: (datos: RegistroInput) => registrarUsuario(datos),
  });
}
