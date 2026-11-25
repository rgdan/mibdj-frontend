import { apiFetch } from '../api/client'
import { errorMessage } from '../api/errors'

export type PersonalRatingData = {
  userId: number
  userName: string
  gameId: number
  gameTitle: string
  rating: number
  comment: string | null
}

export async function getPersonalRating(
  userId: number,
  gameId: number,
  signal: AbortSignal,
): Promise<PersonalRatingData | null> {
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
): Promise<PersonalRatingData> {
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
