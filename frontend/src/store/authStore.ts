import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { cerrarSesion, iniciarSesion, obtenerUsuarioActual } from '@/features/auth/api/auth';
import type { Rol, Usuario } from '@/features/auth/types/auth.types';
import { queryClient } from '@/shared/api/queryClient';

interface AuthState {
  usuario: Usuario | null;
  /** true mientras checkSession confirma con el servidor si la cookie sigue vigente. */
  cargando: boolean;
  /** Lanza el error de la API (401 credenciales, 400 cuenta desactivada) para que el formulario lo muestre. */
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  tieneRol: (...roles: Rol[]) => boolean;
}

/**
 * Sesión del cliente. El token NO está acá: viaja en la cookie HttpOnly, que JavaScript no puede
 * leer. persist guarda una copia del usuario para que la interfaz no "parpadee" al recargar;
 * quien decide si la sesión sigue vigente es el servidor, con /auth/me.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await iniciarSesion(username, password); // el servidor guarda la cookie
        const usuario = await obtenerUsuarioActual();
        // Datos en caché de una sesión anterior no deben verse con la nueva
        queryClient.clear();
        set({ usuario });
      },

      logout: async () => {
        try {
          await cerrarSesion(); // limpiar solo el store no alcanza: la cookie seguiría activa
        } finally {
          queryClient.clear();
          set({ usuario: null });
        }
      },

      checkSession: async () => {
        try {
          set({ usuario: await obtenerUsuarioActual() });
        } catch {
          // 401 (cookie vencida o ausente), 400 (cuenta desactivada) o backend caído
          set({ usuario: null });
        } finally {
          set({ cargando: false });
        }
      },

      tieneRol: (...roles) => {
        const usuario = get().usuario;
        return usuario !== null && roles.includes(usuario.role);
      },
    }),
    {
      name: 'food-store-auth',
      // sessionStorage: la sesión real la mantiene la cookie y /auth/me la restaura
      storage: createJSONStorage(() => sessionStorage),
      // Solo el usuario; nunca el token (no existe en el frontend) ni el estado de carga
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);
