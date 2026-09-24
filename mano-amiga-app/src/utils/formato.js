const opcionesFecha = { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' };

export function fechaHora(valor) {
  if (!valor) return '';
  try {
    return new Date(valor).toLocaleString('es-UY', opcionesFecha);
  } catch {
    return new Date(valor).toISOString().slice(0, 16).replace('T', ' ');
  }
}

export function rangoFechas(inicio, fin) {
  return `${fechaHora(inicio)} → ${fechaHora(fin)}`;
}

export const estadoTexto = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
  abierta: 'Sin validar',
  validada: 'Validada',
  publicada: 'Publicada',
  finalizada: 'Finalizada',
};
