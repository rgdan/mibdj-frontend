import { apiFetch } from './api'

export type Category = { id: number; name: string }

export type Game = {
  id: number
  title: string
  publisher: string
  publicationYear: number
  minPlayers: number
  maxPlayers: number
  durationMin: number
  categories: Category[]
}

export async function getCategories(signal: AbortSignal): Promise<Category[]> {
  const response = await apiFetch('/api/v1/categories', { signal })
  if (!response.ok) throw new Error('No se pudieron cargar las categorías.')
  return response.json()
}

export async function getGames(query: string, signal: AbortSignal): Promise<Game[]> {
  const response = await apiFetch(`/api/v1/games${query ? `?${query}` : ''}`, { signal })
  if (!response.ok) throw new Error('No se pudo cargar el catálogo.')
  return response.json()
}

export async function getGame(id: string, signal: AbortSignal): Promise<Game | null> {
  const response = await apiFetch(`/api/v1/games/${id}`, { signal })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('No se pudo cargar el juego.')
  return response.json()
}
