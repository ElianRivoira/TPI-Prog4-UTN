import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { UnauthorizedPage } from '@/features/auth/pages/UnauthorizedPage';
import { CarritoPage } from '@/features/pedidos/pages/CarritoPage';
import { CheckoutPage } from '@/features/pedidos/pages/CheckoutPage';
import { MisPedidosPage } from '@/features/pedidos/pages/MisPedidosPage';
import { CatalogoPage } from '@/features/productos/pages/CatalogoPage';
import { AdminLayout } from '@/shared/layout/AdminLayout';
import { MainLayout } from '@/shared/layout/MainLayout';

import { ProtectedRoute } from './ProtectedRoute';

// El panel de administración se carga recién cuando un admin entra a él: el cliente no descarga
// esas pantallas ni TanStack Table. AdminLayout muestra un indicador mientras llegan.
const AdminResumenPage = lazy(() =>
  import('@/features/pedidos/pages/AdminResumenPage').then((m) => ({ default: m.AdminResumenPage })),
);
const AdminPedidosPage = lazy(() =>
  import('@/features/pedidos/pages/AdminPedidosPage').then((m) => ({ default: m.AdminPedidosPage })),
);
const AdminProductosPage = lazy(() =>
  import('@/features/productos/pages/AdminProductosPage').then((m) => ({ default: m.AdminProductosPage })),
);
const AdminCategoriasPage = lazy(() =>
  import('@/features/categorias/pages/AdminCategoriasPage').then((m) => ({
    default: m.AdminCategoriasPage,
  })),
);
const AdminUsuariosPage = lazy(() =>
  import('@/features/usuarios/pages/AdminUsuariosPage').then((m) => ({ default: m.AdminUsuariosPage })),
);

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Públicas */}
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Cualquier usuario con sesión */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          </Route>

          {/* Solo admin */}
          <Route element={<ProtectedRoute rolesPermitidos={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="resumen" replace />} />
              <Route path="resumen" element={<AdminResumenPage />} />
              <Route path="pedidos" element={<AdminPedidosPage />} />
              <Route path="productos" element={<AdminProductosPage />} />
              <Route path="categorias" element={<AdminCategoriasPage />} />
              <Route path="usuarios" element={<AdminUsuariosPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
