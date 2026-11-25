import { apiFetch } from '../api/client'

export type PersonalRating = {
  userId: number
  userName: string
  gameId: number
  gameTitle: string
  rating: number
  comment: string | null
}

async function errorMessage(response: Response, fallback: string) {
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

export async function getPersonalRating(
  userId: number,
  gameId: number,
  signal: AbortSignal,
): Promise<PersonalRating | null> {
  const response = await apiFetch(`/api/v1/users/${userId}/ratings/${gameId}`, { signal })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(await errorMessage(response, 'No se pudo consultar tu valoración.'))
  return response.json()
}

export async function savePersonalRating(
  userId: number,
  gameId: number,
  rating: number,
  comment: string,
  signal: AbortSignal,
): Promise<PersonalRating> {
  const response = await apiFetch(`/api/v1/users/${userId}/ratings/${gameId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, comment }),
    signal,
  })
  if (!response.ok) {
    throw new Error(await errorMessage(response, 'No pudimos guardar tu valoración. Intentá de nuevo.'))
  }
  return response.json()
}
