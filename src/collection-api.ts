import { apiFetch } from './api'

export type CollectionStatus = 'nuevo' | 'usado' | 'prestado'

export type CollectionItem = {
  gameId: number
  title: string
  publisher: string
  date: string
  status: CollectionStatus
}

type CollectionInput = {
  date: string
  status: CollectionStatus
}

async function errorMessage(response: Response, fallback: string) {
  try {
    const body = await response.json()
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    if (message && !message.startsWith('Validation failed')) return message
  } catch {
    // La respuesta no incluía JSON legible.
  }
  return fallback
}

function collectionPath(userId: number) {
  return `/api/v1/users/${userId}/collection`
}

export async function getCollection(userId: number, signal: AbortSignal): Promise<CollectionItem[]> {
  const response = await apiFetch(collectionPath(userId), { signal })
  if (!response.ok) throw new Error('No se pudo cargar tu colección.')
  return response.json()
}

export async function getCollectionItem(
  userId: number,
  gameId: number,
  signal: AbortSignal,
): Promise<CollectionItem | null> {
  const response = await apiFetch(`${collectionPath(userId)}/${gameId}`, { signal })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('No se pudo consultar este juego en tu colección.')
  return response.json()
}

export async function addCollectionItem(
  userId: number,
  gameId: number,
  input: CollectionInput,
  signal: AbortSignal,
): Promise<CollectionItem> {
  const response = await apiFetch(collectionPath(userId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, ...input }),
    signal,
  })
  if (!response.ok) {
    const fallback = response.status === 409
      ? 'Este juego ya está en tu colección. Actualizá la página para ver el estado actual.'
      : 'No pudimos agregar el juego. Intentá de nuevo.'
    throw new Error(await errorMessage(response, fallback))
  }
  return response.json()
}

export async function updateCollectionItem(
  userId: number,
  gameId: number,
  input: CollectionInput,
  signal: AbortSignal,
): Promise<CollectionItem> {
  const response = await apiFetch(`${collectionPath(userId)}/${gameId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal,
  })
  if (!response.ok) {
    throw new Error(await errorMessage(response, 'No pudimos actualizar el juego. Intentá de nuevo.'))
  }
  return response.json()
}

export async function removeCollectionItem(
  userId: number,
  gameId: number,
  signal: AbortSignal,
): Promise<void> {
  const response = await apiFetch(`${collectionPath(userId)}/${gameId}`, {
    method: 'DELETE',
    signal,
  })
  if (!response.ok) {
    throw new Error(await errorMessage(response, 'No pudimos quitar el juego. Intentá de nuevo.'))
  }
}
