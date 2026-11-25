import { useEffect, useState } from 'react'
import CollectionActions from './CollectionActions'
import { getCollection } from './collection-api'
import type { CollectionItem } from './collection-api'
import type { User } from '../users/users-api'

function Collection({ user }: { user: User }) {
  const [items, setItems] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    getCollection(user.id, controller.signal)
      .then(items => { if (!controller.signal.aborted) setItems(items) })
      .catch(() => { if (!controller.signal.aborted) setError(true) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [user.id, attempt])

  function updateItem(gameId: number, updated: CollectionItem | null) {
    setItems(items => updated
      ? items.map(item => item.gameId === gameId ? updated : item)
      : items.filter(item => item.gameId !== gameId))
  }

  return <>
    <p>Juegos que tenés, con su fecha de adquisición y estado actual.</p>
    <div aria-busy={loading}>
      {loading ? <p role="status">Cargando tu colección…</p>
        : error ? <div role="alert" className="catalog-message">
          <p>No pudimos cargar tu colección. Comprobá la conexión e intentá de nuevo.</p>
          <button type="button" onClick={() => setAttempt(attempt => attempt + 1)}>Reintentar</button>
        </div>
        : items.length === 0 ? <div className="collection-empty" role="status">
          <p>Tu colección está vacía.</p>
          <a className="button-link" href="#/catalogo">Buscar juegos en el catálogo</a>
        </div>
        : <ul className="game-list collection-list">
          {items.map(item => <li key={item.gameId}>
            <article>
              <h2><a href={`#/catalogo/${item.gameId}`}>{item.title}</a></h2>
              <p className="game-publisher">{item.publisher}</p>
              <CollectionActions userId={user.id} gameId={item.gameId} item={item} onChange={updated => updateItem(item.gameId, updated)} />
            </article>
          </li>)}
        </ul>}
    </div>
  </>
}

export default Collection
