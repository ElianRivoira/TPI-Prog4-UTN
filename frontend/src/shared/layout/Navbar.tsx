import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

import { Button } from '../ui/Button';
import { cn } from '../ui/cn';

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isActive ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-100',
  );

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cantidadEnCarrito = useCartStore((s) => s.cantidadItems());
  const navigate = useNavigate();

  const esAdmin = usuario?.role === 'admin';

  async function cerrarSesion() {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link to="/" className="text-lg font-bold text-orange-600">
          Food Store
        </Link>

        <nav className="flex flex-1 flex-wrap items-center gap-1">
          <NavLink to="/" end className={claseEnlace}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={claseEnlace}>
            Carrito
            {cantidadEnCarrito > 0 && (
              <span className="ml-1.5 rounded-full bg-orange-600 px-1.5 py-0.5 text-xs text-white">
                {cantidadEnCarrito}
              </span>
            )}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={claseEnlace}>
              Mis pedidos
            </NavLink>
          )}
          {/* Ocultar el enlace mejora la experiencia; la ruta y el backend son los que protegen */}
          {esAdmin && (
            <NavLink to="/admin" className={claseEnlace}>
              Panel admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {usuario ? (
            <>
              <span className="text-sm text-slate-700">
                {usuario.full_name}
                <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                  {usuario.role}
                </span>
              </span>
              <Button variante="secundario" tamano="sm" onClick={() => void cerrarSesion()}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseEnlace}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className={claseEnlace}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
