import axios from 'axios';

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
