export type Rol = 'user' | 'admin';

/** Respuesta de GET /auth/me (UserPublic en el backend). Nunca incluye el token ni el hash. */
export interface Usuario {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Rol;
  disabled: boolean;
  created_at: string;
}
