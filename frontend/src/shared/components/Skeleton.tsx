import { cn } from '../ui/cn';

/** Bloque gris animado que ocupa el lugar del contenido mientras carga. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-slate-200', className)} />;
}
