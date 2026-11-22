import axios from 'axios';

interface ErrorDeValidacion {
  msg: string;
}

function esListaDeValidacion(detail: unknown): detail is ErrorDeValidacion[] {
  return (
    Array.isArray(detail) &&
    detail.every(
      (e: unknown) =>
        typeof e === 'object' && e !== null && typeof (e as { msg?: unknown }).msg === 'string',
    )
  );
}

/**
 * Convierte un error de la API en un mensaje para la pantalla.
 *
 * FastAPI responde {"detail": "..."}: en 400, 404 y 409 el detail del backend es el mensaje más
 * preciso (por ejemplo, «Stock insuficiente para ...»). En 422, detail es la lista de errores
 * de validación de Pydantic.
 */
export function handleApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Error inesperado.';
  if (error.code === 'ECONNABORTED') return 'El servidor tardó demasiado en responder.';
  if (!error.response) return 'No se pudo conectar con el servidor.';

  const { status, data } = error.response;
  const detail: unknown = (data as { detail?: unknown } | undefined)?.detail;

  if (status === 401) return 'La sesión venció. Es necesario iniciar sesión de nuevo.';
  if (status === 403) return 'No tenés permisos para realizar esta acción.';
  if (status === 422) {
    if (esListaDeValidacion(detail) && detail.length > 0) {
      // Pydantic antepone "Value error, " a los mensajes de los field_validator
      return detail.map((e) => e.msg.replace(/^Value error, /, '')).join(' · ');
    }
    return 'Los datos enviados no son válidos.';
  }
  if (typeof detail === 'string') return detail;
  if (status < 500) return 'No se pudo completar la operación.';
  return 'Error del servidor. Intentá nuevamente más tarde.';
}
