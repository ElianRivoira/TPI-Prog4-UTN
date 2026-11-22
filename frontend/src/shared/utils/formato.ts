const formatoPrecio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

const formatoFecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' });

export function formatearPrecio(monto: number): string {
  return formatoPrecio.format(monto);
}

/**
 * Las fechas del backend se guardan en UTC. Si llegan sin zona horaria (por ejemplo, con SQLite),
 * se interpretan como UTC para no mostrarlas corridas.
 */
export function formatearFecha(iso: string): string {
  const conZona = /([zZ]|[+-]\d{2}:?\d{2})$/.test(iso) ? iso : `${iso}Z`;
  return formatoFecha.format(new Date(conZona));
}
