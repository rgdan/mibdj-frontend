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
