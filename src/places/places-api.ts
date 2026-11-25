import { apiFetch } from '../api/client'

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
