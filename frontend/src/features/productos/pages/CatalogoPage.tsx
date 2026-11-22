import { useState } from 'react';

import { useCategorias } from '@/features/categorias/hooks/useCategorias';
import { handleApiError } from '@/shared/api/handleApiError';
import { EstadoError } from '@/shared/components/EstadoError';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { Paginacion } from '@/shared/components/Paginacion';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/ui/cn';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';

import { ProductoCard } from '../components/ProductoCard';
import { ProductoCardSkeleton } from '../components/ProductoCardSkeleton';
import { useProductos } from '../hooks/useProductos';

const LIMIT = 12;

export function CatalogoPage() {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [pagina, setPagina] = useState(0);
  const busquedaDemorada = useDebounce(busqueda.trim());

  const categorias = useCategorias();
  const productos = useProductos({
    skip: pagina * LIMIT,
    limit: LIMIT,
    search: busquedaDemorada || undefined,
    categoria_id: categoriaId,
    // El cliente solo ve lo que el admin marcó como disponible
    disponible: true,
  });

  const hayFiltros = busquedaDemorada !== '' || categoriaId !== undefined;

  function limpiarFiltros() {
    setBusqueda('');
    setCategoriaId(undefined);
    setPagina(0);
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Catálogo</h1>
        <div className="grid gap-3 sm:w-[32rem] sm:grid-cols-2">
          <Input
            label="Buscar"
            type="search"
            placeholder="Nombre del producto"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(0);
            }}
          />
          <Select
            label="Categoría"
            value={categoriaId ?? ''}
            disabled={categorias.isPending}
            onChange={(e) => {
              setCategoriaId(e.target.value ? Number(e.target.value) : undefined);
              setPagina(0);
            }}
          >
            <option value="">Todas</option>
            {categorias.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        </div>
      </header>

      {productos.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <ProductoCardSkeleton key={i} />
          ))}
        </div>
      ) : productos.isError ? (
        <EstadoError
          mensaje={handleApiError(productos.error)}
          onReintentar={() => void productos.refetch()}
        />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          mensaje={hayFiltros ? 'Probá con otra búsqueda o categoría.' : 'Todavía no hay productos cargados.'}
          accion={
            hayFiltros && (
              <Button variante="secundario" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <>
          <div
            className={cn(
              'grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
              productos.isPlaceholderData && 'opacity-60',
            )}
          >
            {productos.data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion
            pagina={pagina}
            total={productos.data.total}
            limit={LIMIT}
            onCambiar={setPagina}
          />
        </>
      )}
    </section>
  );
}
