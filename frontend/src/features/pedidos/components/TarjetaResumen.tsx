import { Card } from '@/shared/ui/Card';
import { cn } from '@/shared/ui/cn';

export type Tono = 'ambar' | 'cielo' | 'esmeralda' | 'pizarra' | 'naranja';

const estilosTono: Record<Tono, string> = {
  ambar: 'border-l-amber-400',
  cielo: 'border-l-sky-400',
  esmeralda: 'border-l-emerald-400',
  pizarra: 'border-l-slate-400',
  naranja: 'border-l-orange-500',
};

interface TarjetaResumenProps {
  titulo: string;
  valor: string;
  detalle?: string;
  tono: Tono;
}

/** Un indicador del resumen del panel: título, valor destacado y una aclaración opcional. */
export function TarjetaResumen({ titulo, valor, detalle, tono }: TarjetaResumenProps) {
  return (
    <Card className={cn('flex flex-col gap-1 border-l-4', estilosTono[tono])}>
      <span className="text-sm font-medium text-slate-500">{titulo}</span>
      <span className="text-3xl font-bold text-slate-900">{valor}</span>
      {detalle && <span className="text-xs text-slate-500">{detalle}</span>}
    </Card>
  );
}
