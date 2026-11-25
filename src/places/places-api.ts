import { apiFetch } from '../api/client'
import { errorMessage } from '../api/errors'

export const PLACE_TEXT_MAX_LENGTH = 255

export type Place = {
  placeId: number
  name: string
  address: string
}

export async function getPlaces(userId: number, signal: AbortSignal): Promise<Place[]> {
  const response = await apiFetch(`/api/v1/users/${userId}/places`, { signal })
  if (!response.ok) throw new Error('No se pudieron cargar los lugares.')
  return response.json()
}

export async function createPlace(
  userId: number,
  input: { name: string; address: string },
  signal: AbortSignal,
): Promise<Place> {
  const response = await apiFetch(`/api/v1/users/${userId}/places`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: input.name.trim(), address: input.address.trim() }),
    signal,
  })
  if (!response.ok) {
    throw new Error(await errorMessage(response, 'No pudimos guardar el lugar. Revisá los datos e intentá de nuevo.'))
  }
  return response.json()
}
