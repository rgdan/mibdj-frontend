import { useEffect, useState } from 'react'
import WishlistActions from './WishlistActions'
import { getWishlist, removeWishlistItem } from './wishlist-api'
import type { WishlistItem } from './wishlist-api'
import { getCollection } from '../collection/collection-api'
import type { User } from '../users/users-api'

function sortWishlist(items: WishlistItem[]) {
  return [...items].sort((a, b) => b.priority - a.priority || b.date.localeCompare(a.date))
}

function Wishlist({ user }: { user: User }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [cleanupError, setCleanupError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setItems([])
    setLoading(true)
    setError(false)
    setCleanupError(false)
    Promise.all([
      getWishlist(user.id, controller.signal),
      getCollection(user.id, controller.signal),
    ])
      .then(async ([wishlist, collection]) => {
        if (controller.signal.aborted) return
        const ownedIds = new Set(collection.map(item => item.gameId))
        const duplicates = wishlist.filter(item => ownedIds.has(item.gameId))
        setItems(sortWishlist(wishlist.filter(item => !ownedIds.has(item.gameId))))
        const results = await Promise.all(duplicates.map(async item => {
          try {
            await removeWishlistItem(user.id, item.gameId, controller.signal)
            return true
          } catch {
            return false
          }
        }))
        if (!controller.signal.aborted) setCleanupError(results.some(result => !result))
      })
      .catch(() => { if (!controller.signal.aborted) setError(true) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [user.id, attempt])

  function updateItem(gameId: number, updated: WishlistItem | null) {
    setItems(items => sortWishlist(updated
      ? items.some(item => item.gameId === gameId)
        ? items.map(item => item.gameId === gameId ? updated : item)
        : [...items, updated]
      : items.filter(item => item.gameId !== gameId)))
  }

  return <>
    <p>Juegos que te gustaría adquirir, ordenados por prioridad.</p>
    <div aria-busy={loading}>
      {loading ? <p role="status">Cargando tus deseos…</p>
        : error ? <div role="alert" className="catalog-message">
          <p>No pudimos cargar tus deseos o verificar tu colección. Comprobá la conexión e intentá de nuevo.</p>
          <button type="button" onClick={() => setAttempt(attempt => attempt + 1)}>Reintentar</button>
        </div>
        : <>
          {cleanupError && <div role="alert" className="catalog-message">
            <p>Quitamos de la lista los juegos que ya tienes, pero no pudimos actualizar todos los datos. Intentá de nuevo.</p>
            <button type="button" onClick={() => setAttempt(attempt => attempt + 1)}>Reintentar</button>
          </div>}
          {items.length === 0 ? <div className="collection-empty" role="status">
            <p>Tu lista de deseos está vacía.</p>
            <a className="button-link" href="#/catalogo">Buscar juegos en el catálogo</a>
          </div>
          : <ul className="game-list collection-list">
            {items.map(item => <li key={item.gameId}>
              <article>
                <h2><a href={`#/catalogo/${item.gameId}`}>{item.title}</a></h2>
                <p className="game-publisher">{item.publisher}</p>
                <WishlistActions userId={user.id} gameId={item.gameId} item={item} onChange={updated => updateItem(item.gameId, updated)} />
              </article>
            </li>)}
          </ul>}
        </>}
    </div>
  </>
}

export default Wishlist
