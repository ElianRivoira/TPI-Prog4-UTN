import type { ReactNode } from 'react';

import { cn } from './cn';

type Tipo = 'error' | 'exito' | 'info';

const estilos: Record<Tipo, string> = {
  error: 'border-red-200 bg-red-50 text-red-700',
  exito: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
};

/** Mensaje en línea (por ejemplo, el error de la API junto a un formulario). */
export function Alerta({ tipo = 'error', children }: { tipo?: Tipo; children: ReactNode }) {
  return (
    <div
      role={tipo === 'error' ? 'alert' : 'status'}
      className={cn('rounded-lg border px-3 py-2 text-sm', estilos[tipo])}
    >
      {children}
    </div>
  );
}
