/**
 * Validaciones cliente comunes para el frontend.
 *
 * Importante: estas validaciones complementan las del backend; no lo
 * reemplazan. El backend siempre tiene la última palabra.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Devuelve true si la cadena tiene formato de correo electrónico válido. */
export const esEmailValido = (valor) => EMAIL_RE.test(String(valor || '').trim())

/**
 * Teléfono: solo dígitos, +, espacios y guiones; entre 7 y 20 caracteres.
 * Esta es una validación laxa que respeta los formatos internacionales típicos.
 */
export const esTelefonoValido = (valor) => {
  const v = String(valor || '').trim()
  if (!v) return true // teléfono es opcional en varios contratos
  return /^[+\d][\d\s-]{6,19}$/.test(v)
}

/**
 * Validación específica de identificaciones según el tipo seleccionado.
 *  - CEDULA / CC: 10 dígitos.
 *  - RUC: 13 dígitos.
 *  - PASAPORTE: alfanumérico, 6-15 caracteres.
 *  - OTRO: alfanumérico, 4-20 caracteres.
 */
export const esIdentificacionValida = (tipo, valor) => {
  const v = String(valor || '').trim()
  if (!v) return false
  switch ((tipo || '').toUpperCase()) {
    case 'CEDULA':
    case 'CC':
      return /^\d{10}$/.test(v)
    case 'RUC':
      return /^\d{13}$/.test(v)
    case 'PASAPORTE':
      return /^[A-Za-z0-9]{6,15}$/.test(v)
    default:
      return /^[A-Za-z0-9]{4,20}$/.test(v)
  }
}

/** Devuelve un mensaje de error para identificación inválida según el tipo. */
export const mensajeIdentificacion = (tipo) => {
  switch ((tipo || '').toUpperCase()) {
    case 'CEDULA':
    case 'CC':
      return 'La cédula debe tener exactamente 10 dígitos.'
    case 'RUC':
      return 'El RUC debe tener exactamente 13 dígitos.'
    case 'PASAPORTE':
      return 'El pasaporte debe tener entre 6 y 15 caracteres alfanuméricos.'
    default:
      return 'Identificación inválida (4-20 caracteres alfanuméricos).'
  }
}
