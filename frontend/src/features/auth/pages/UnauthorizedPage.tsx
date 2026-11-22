import { Link } from 'react-router-dom';

import { Card } from '@/shared/ui/Card';

export function UnauthorizedPage() {
  return (
    <Card className="mx-auto mt-12 max-w-md text-center">
      <h1 className="text-xl font-semibold text-slate-900">Sin permiso</h1>
      <p className="mt-2 text-sm text-slate-600">No tenés permisos para ver esta pantalla.</p>
      <Link
        to="/"
        className="mt-4 inline-block text-sm font-medium text-orange-600 hover:text-orange-700"
      >
        Volver al inicio
      </Link>
    </Card>
  );
}
