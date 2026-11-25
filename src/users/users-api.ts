import { apiFetch } from '../api/client'

export type User = {
  id: number
  name: string
  email: string
  country: string
  date: string
}

export async function getUsers(signal: AbortSignal): Promise<User[]> {
  const response = await apiFetch('/api/v1/users', { signal })
  if (!response.ok) throw new Error('No se pudieron cargar los usuarios.')
  return response.json()
}
