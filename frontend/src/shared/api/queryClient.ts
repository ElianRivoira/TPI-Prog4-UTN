import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

/** Instancia única de TanStack Query: caché del estado del servidor. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Un 4xx (sin sesión, sin permiso, no encontrado) no se arregla reintentando
      retry: (failureCount, error) => {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        if (status !== undefined && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
