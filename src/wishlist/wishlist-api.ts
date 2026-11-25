import { apiFetch } from '../api/client'
import { errorMessage } from '../api/errors'
import { getCollectionItem } from '../collection/collection-api'

export type WishlistPriority = 1 | 2 | 3

export type WishlistItem = {
  gameId: number
  title: string
  publisher: string
  priority: WishlistPriority
  date: string
}

function wishlistPath(userId: number) {
  return `/api/v1/users/${userId}/wishlist`
}

async function ensureNotOwned(userId: number, gameId: number, signal: AbortSignal) {
  const collectionItem = await getCollectionItem(userId, gameId, signal)
  if (collectionItem) {
    throw new Error('Este juego ya está en tu colección y no se puede agregar a deseos.')
  }
}

export async function getWishlist(userId: number, signal: AbortSignal): Promise<WishlistItem[]> {
  const response = await apiFetch(wishlistPath(userId), { signal })
  if (!response.ok) throw new Error('No se pudo cargar tu lista de deseos.')
  return response.json()
}

export async function getWishlistItem(
  userId: number,
  gameId: number,
  signal: AbortSignal,
): Promise<WishlistItem | null> {
  const response = await apiFetch(`${wishlistPath(userId)}/${gameId}`, { signal })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('No se pudo consultar este juego en tus deseos.')
  return response.json()
}

export async function addWishlistItem(
  userId: number,
  gameId: number,
  priority: WishlistPriority,
  signal: AbortSignal,
): Promise<WishlistItem> {
  await ensureNotOwned(userId, gameId, signal)

  const response = await apiFetch(wishlistPath(userId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, priority }),
    signal,
  })
  if (!response.ok) {
    const fallback = response.status === 409
      ? 'Este juego ya está en tu lista de deseos. Actualizá la página para ver el estado actual.'
      : 'No pudimos agregar el juego a tus deseos. Intentá de nuevo.'
    throw new Error(await errorMessage(response, fallback))
  }
  return response.json()
}

export async function updateWishlistItem(
  userId: number,
  gameId: number,
  priority: WishlistPriority,
  signal: AbortSignal,
): Promise<WishlistItem> {
  await ensureNotOwned(userId, gameId, signal)
  const response = await apiFetch(`${wishlistPath(userId)}/${gameId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priority }),
    signal,
  })
  if (!response.ok) {
    throw new Error(await errorMessage(response, 'No pudimos actualizar la prioridad. Intentá de nuevo.'))
  }
  return response.json()
}

export async function removeWishlistItem(
  userId: number,
  gameId: number,
  signal: AbortSignal,
): Promise<void> {
  const response = await apiFetch(`${wishlistPath(userId)}/${gameId}`, {
    method: 'DELETE',
    signal,
  })
  if (response.status === 404) return
  if (!response.ok) {
    throw new Error(await errorMessage(response, 'No pudimos quitar el juego de tus deseos. Intentá de nuevo.'))
  }
}
