/**
 * Validadores de los formularios de productos, con las mismas reglas que ProductoCreate en el
 * backend. Los inputs numéricos se manejan como texto y se convierten al enviar.
 */

type Validador = ({ value }: { value: string }) => string | undefined;

export const validarNombre: Validador = ({ value }) => {
  const v = value.trim();
  if (v.length === 0) return 'El nombre es obligatorio';
  if (v.length > 150) return 'Máximo 150 caracteres';
  return undefined;
};

export const validarPrecio: Validador = ({ value }) => {
  if (value.trim() === '') return 'El precio es obligatorio';
  const precio = Number(value);
  if (!Number.isFinite(precio) || precio < 0) return 'Ingresá un precio mayor o igual a 0';
  return undefined;
};

export const validarStock: Validador = ({ value }) =>
  /^\d+$/.test(value.trim()) ? undefined : 'Ingresá un número entero mayor o igual a 0';

export const validarImagenUrl: Validador = ({ value }) => {
  const v = value.trim();
  if (v === '') return undefined;
  try {
    const { protocol } = new URL(v);
    return protocol === 'http:' || protocol === 'https:' ? undefined : 'La URL debe empezar con http:// o https://';
  } catch {
    return 'Ingresá una URL válida';
  }
};

export const validarCategoria: Validador = ({ value }) => (value === '' ? 'Elegí una categoría' : undefined);
