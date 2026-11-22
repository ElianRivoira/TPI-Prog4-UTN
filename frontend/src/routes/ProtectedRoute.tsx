import { Navigate, Outlet, useLocation } from 'react-router-dom';

import type { Rol } from '@/features/auth/types/auth.types';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  /** Sin roles alcanza con tener sesión. */
  rolesPermitidos?: Rol[];
}

/**
 * Guardián de rutas. Ordena la navegación; la protección real está en el backend
 * (get_current_active_user y require_role responden 401/400/403).
 */
export function ProtectedRoute({ rolesPermitidos }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const location = useLocation();

  // Mientras checkSession confirma la cookie no se redirige: un usuario con sesión válida
  // que recarga /admin/... sería enviado al login antes de que llegue la respuesta
  if (cargando) {
    return (
      <div role="status" className="flex justify-center py-16 text-sm text-slate-500">
        Verificando sesión...
      </div>
    );
  }

  if (!usuario) {
    // state.from: el login vuelve a la pantalla que se pidió
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
