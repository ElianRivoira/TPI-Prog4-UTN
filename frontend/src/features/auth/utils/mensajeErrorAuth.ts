import axios from 'axios';

import { handleApiError } from '@/shared/api/handleApiError';

/**
 * En login y registro, un 401 no es «sesión vencida» sino «credenciales incorrectas»: se muestra
 * el detail del backend tal cual. Para el resto (422, red, 5xx) se usa el manejador general.
 */
export function mensajeErrorAuth(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status !== 422) {
    const detail: unknown = (error.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === 'string') return detail;
  }
  return handleApiError(error);
}
