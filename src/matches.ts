import { apiFetch } from './api'
import type { User } from './session'

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

export type Place = {
  placeId: number
  name: string
  address: string
}

export type NewMatch = {
  gameId: number
  placeId: number
  fecha: string
  duracionMin: number
  notas: string | null
  participantes: Participant[]
}

export type UserStats = {
  mostPlayedGames: { gameId: number; gameTitle: string; matchesPlayed: number }[]
  averageDurationByGame: { gameId: number; gameTitle: string; averageDurationMin: number }[]
  frequentCompanions: { userId: number; userName: string; sharedMatches: number }[]
}

export const NOTES_MAX_LENGTH = 255

// Lee el mensaje que manda el backend (server.error.include-message=always).
// Los errores de validación de Spring no son legibles para el usuario, así que se reemplazan.
async function backendMessage(response: Response, fallback: string) {
  try {
    const body = await response.json()
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    if (message && !message.startsWith('Validation failed')) return message
  } catch {
    // La respuesta no traía JSON
  }
  return fallback
}

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
    throw new Error(await backendMessage(response, fallback))
  }
  return response.json()
}

export async function getPlaces(userId: number, signal: AbortSignal): Promise<Place[]> {
  const response = await apiFetch(`/api/v1/users/${userId}/places`, { signal })
  if (!response.ok) throw new Error('No se pudieron cargar los lugares.')
  return response.json()
}

export async function getUsers(signal: AbortSignal): Promise<User[]> {
  const response = await apiFetch('/api/v1/users', { signal })
  if (!response.ok) throw new Error('No se pudieron cargar los usuarios.')
  return response.json()
}

export async function getStats(userId: number, signal: AbortSignal): Promise<UserStats> {
  const response = await apiFetch(`/api/v1/users/${userId}/stats`, { signal })
  if (!response.ok) throw new Error('No se pudieron cargar las estadísticas.')
  return response.json()
}

// "2026-03-07" → "7 mar 2026". Se arma la fecha en hora local para que no cambie de día.
export function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return isoDate
  return new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium' }).format(new Date(year, month - 1, day))
}

export function todayIso() {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

export function joinNames(names: string[]) {
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`
}
