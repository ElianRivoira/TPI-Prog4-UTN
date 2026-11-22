import { useEffect } from 'react';

import { useAuthStore } from './store/authStore';

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession);
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);

  // Única llamada al servidor dentro de un useEffect: confirmar la sesión al montar la app
  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-3xl font-bold text-orange-600">Food Store</h1>
      <p className="text-sm text-slate-500">
        {cargando ? 'Verificando sesión...' : usuario ? `Sesión de ${usuario.username}` : 'Sin sesión'}
      </p>
    </main>
  );
}
