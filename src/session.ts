import { apiFetch } from './api'

export type User = {
  id: number
  name: string
  email: string
  country: string
  date: string
}

export async function login(email: string, signal: AbortSignal): Promise<User> {
  const response = await apiFetch('/api/v1/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() }),
    signal,
  }).catch(error => {
    if (signal.aborted) throw error
    throw new Error('No pudimos conectar con el servidor. Intentá de nuevo.')
  })

  if (response.status === 400) {
    throw new Error('Revisá el formato del email.')
  }
  if (response.status === 404) {
    throw new Error('No encontramos un usuario con ese email.')
  }
  if (!response.ok) {
    throw new Error('No pudimos iniciar el acceso. Intentá de nuevo.')
  }

  return response.json()
}
