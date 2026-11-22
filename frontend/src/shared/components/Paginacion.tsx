import { Button } from '../ui/Button';

interface PaginacionProps {
  /** Página actual, empezando en 0 (skip = pagina × limit). */
  pagina: number;
  total: number;
  limit: number;
  onCambiar: (pagina: number) => void;
}

export function Paginacion({ pagina, total, limit, onCambiar }: PaginacionProps) {
  const totalPaginas = Math.max(1, Math.ceil(total / limit));
  if (totalPaginas <= 1) return null;

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-3">
      <Button
        variante="secundario"
        tamano="sm"
        disabled={pagina === 0}
        onClick={() => onCambiar(pagina - 1)}
      >
        Anterior
      </Button>
      <span className="text-sm text-slate-600">
        Página {pagina + 1} de {totalPaginas}
      </span>
      <Button
        variante="secundario"
        tamano="sm"
        disabled={pagina + 1 >= totalPaginas}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente
      </Button>
    </nav>
  );
}
