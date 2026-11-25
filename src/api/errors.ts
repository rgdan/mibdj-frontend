// Lee el mensaje de una respuesta HTTP fallida; usa el texto de respaldo si no es legible.
export async function errorMessage(response: Response, fallback: string) {
  try {
    const body = await response.json()
    const message = typeof body?.message === 'string' ? body.message.trim()
      : typeof body?.detail === 'string' ? body.detail.trim()
      : ''
    if (message && !message.startsWith('Validation failed')) return message
  } catch {
    // La respuesta no incluía JSON legible.
  }
  return fallback
}

// Convierte un error capturado en texto para la pantalla; reemplaza los errores de red por el respaldo.
export function userErrorMessage(
  error: unknown,
  fallback = 'No pudimos conectar con el servidor. Intentá de nuevo.',
) {
  return error instanceof Error && !(error instanceof TypeError) && error.message.trim()
    ? error.message
    : fallback
}
