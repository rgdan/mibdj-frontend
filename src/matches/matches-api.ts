import { apiFetch } from '../api/client'
import { errorMessage } from '../api/errors'

export type Participant = {
  userId: number
  puntos: number
  ganador: boolean
}

export type Match = {
  matchId: number
  userId: number
  gameId?: number
  gameTitle?: string
  placeId?: number
  placeName?: string
  fecha: string
  duracionMin: number
  notas?: string
  participantesCount?: number
  participantes?: Participant[]
}

export type NewMatch = {
  gameId: number
  placeId: number
  fecha: string
  duracionMin: number
  notas: string | null
  participantes: Participant[]
}

export const NOTES_MAX_LENGTH = 255

export async function getMatches(userId: number, signal: AbortSignal): Promise<Match[]> {
  const response = await apiFetch(`/api/v1/users/${userId}/matches`, { signal })
  if (!response.ok) throw new Error('No se pudo cargar el historial.')
  return response.json()
}

export async function getMatch(userId: number, matchId: string, signal: AbortSignal): Promise<Match | null> {
  const response = await apiFetch(`/api/v1/users/${userId}/matches/${matchId}`, { signal })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('No se pudo cargar la partida.')
  return response.json()
}

export async function createMatch(userId: number, match: NewMatch, signal: AbortSignal): Promise<Match> {
  const response = await apiFetch(`/api/v1/users/${userId}/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(match),
    signal,
  })
  if (!response.ok) {
    const fallback = response.status === 400
      ? 'El servidor rechazó los datos. Revisá el formulario.'
      : response.status === 404
        ? 'Alguno de los datos elegidos ya no existe. Recargá la página e intentá de nuevo.'
        : 'No pudimos guardar la partida. Intentá de nuevo.'
    throw new Error(await errorMessage(response, fallback))
  }
  return response.json()
}
