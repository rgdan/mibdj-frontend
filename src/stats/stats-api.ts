import { apiFetch } from '../api/client'

export type UserStats = {
  mostPlayedGames: { gameId: number; gameTitle: string; matchesPlayed: number }[]
  averageDurationByGame: { gameId: number; gameTitle: string; averageDurationMin: number }[]
  frequentCompanions: { userId: number; userName: string; sharedMatches: number }[]
}

export async function getStats(userId: number, signal: AbortSignal): Promise<UserStats> {
  const response = await apiFetch(`/api/v1/users/${userId}/stats`, { signal })
  if (!response.ok) throw new Error('No se pudieron cargar las estadísticas.')
  return response.json()
}
