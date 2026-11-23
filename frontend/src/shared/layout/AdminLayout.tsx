import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { cn } from '../ui/cn';

const secciones = [
  { to: '/admin/resumen', etiqueta: 'Resumen' },
  { to: '/admin/pedidos', etiqueta: 'Pedidos' },
  { to: '/admin/productos', etiqueta: 'Productos' },
  { to: '/admin/categorias', etiqueta: 'Categorías' },
  { to: '/admin/usuarios', etiqueta: 'Usuarios' },
];

/** Pestañas del panel de administración. */
export function AdminLayout() {
  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Panel de administración" className="flex flex-wrap gap-1 border-b border-slate-200">
        {secciones.map(({ to, etiqueta }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                '-mb-px border-b-2 px-3 py-2 text-sm font-medium',
                isActive
                  ? 'border-orange-600 text-orange-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700',
              )
            }
          >
            {etiqueta}
          </NavLink>
        ))}
      </nav>
      {/* Las pantallas del panel se cargan con lazy (ver AppRouter) */}
      <Suspense
        fallback={
          <div role="status" className="flex justify-center py-16 text-sm text-slate-500">
            Cargando...
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </div>
  );
}
