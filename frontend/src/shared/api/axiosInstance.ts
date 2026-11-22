import axios, { type AxiosError } from 'axios';

/**
 * Cliente HTTP único de la aplicación.
 *
 * withCredentials: el frontend (localhost:5173) y la API (localhost:8000) son orígenes distintos;
 * sin esta opción el navegador no guarda ni envía la cookie HttpOnly con el JWT.
 * El token nunca pasa por JavaScript: lo maneja el navegador.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  timeout: 10_000,
  withCredentials: true,
});

/** Peticiones en las que un 401/400 es parte del funcionamiento normal y lo maneja quien llama. */
const RUTAS_DE_AUTH = ['/auth/token', '/auth/me'];
const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada';

let alPerderSesion: () => void = () => {};

/**
 * Registra qué hacer cuando la API indica que la sesión ya no sirve. Lo registra el authStore:
 * así shared/ no importa el store y se evita la dependencia circular api → store → api.
 */
export function onSesionPerdida(callback: () => void): void {
  alPerderSesion = callback;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url ?? '';
    const esDeAuth = RUTAS_DE_AUTH.some((ruta) => url.startsWith(ruta));
    const status = error.response?.status;
    const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail;

    const sesionVencida = status === 401;
    const cuentaDesactivada = status === 400 && detail === CUENTA_DESACTIVADA;

    if (!esDeAuth && (sesionVencida || cuentaDesactivada)) {
      // Limpia la sesión del cliente; ProtectedRoute redirige a /login al quedar sin usuario.
      // No recarga la página para no entrar en bucle sobre /login.
      alPerderSesion();
    }
    // Se propaga igual: el componente que hizo la petición también puede reaccionar
    return Promise.reject(error);
  },
);
