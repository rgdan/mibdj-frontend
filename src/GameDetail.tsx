import { useEffect, useState } from 'react'
import { getGame } from './games'
import type { Game } from './games'
import CollectionActions from './CollectionActions'
import { getCollectionItem } from './collection-api'
import type { CollectionItem } from './collection-api'
import WishlistActions from './WishlistActions'
import { getWishlistItem, removeWishlistItem } from './wishlist-api'
import type { WishlistItem } from './wishlist-api'
import type { User } from './session'

function GameDetail({ id, query, user }: { id: string; query: string; user: User }) {
  const [game, setGame] = useState<Game | null>(null)
  const [collectionItem, setCollectionItem] = useState<CollectionItem | null>(null)
  const [collectionLoading, setCollectionLoading] = useState(true)
  const [collectionError, setCollectionError] = useState(false)
  const [collectionAttempt, setCollectionAttempt] = useState(0)
  const [wishlistItem, setWishlistItem] = useState<WishlistItem | null>(null)
  const [wishlistLoading, setWishlistLoading] = useState(true)
  const [wishlistError, setWishlistError] = useState(false)
  const [wishlistAttempt, setWishlistAttempt] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    getGame(id, controller.signal)
      .then(game => { if (!controller.signal.aborted) setGame(game) })
      .catch(() => { if (!controller.signal.aborted) setError(true) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [id, attempt])

  useEffect(() => {
    const controller = new AbortController()
    setCollectionLoading(true)
    setCollectionError(false)
    getCollectionItem(user.id, Number(id), controller.signal)
      .then(item => { if (!controller.signal.aborted) setCollectionItem(item) })
      .catch(() => { if (!controller.signal.aborted) setCollectionError(true) })
      .finally(() => { if (!controller.signal.aborted) setCollectionLoading(false) })
    return () => controller.abort()
  }, [id, user.id, collectionAttempt])

  useEffect(() => {
    const controller = new AbortController()
    setWishlistItem(null)
    setWishlistLoading(true)
    setWishlistError(false)
    getWishlistItem(user.id, Number(id), controller.signal)
      .then(item => { if (!controller.signal.aborted) setWishlistItem(item) })
      .catch(() => { if (!controller.signal.aborted) setWishlistError(true) })
      .finally(() => { if (!controller.signal.aborted) setWishlistLoading(false) })
    return () => controller.abort()
  }, [id, user.id, wishlistAttempt])

  async function removeWishlistAfterAcquisition(gameId: number) {
    const controller = new AbortController()
    const item = await getWishlistItem(user.id, gameId, controller.signal)
    if (item) await removeWishlistItem(user.id, gameId, controller.signal)
    setWishlistItem(null)
  }

  return <>
    <a className="catalog-back" href={`#/catalogo${query ? `?${query}` : ''}`}>Volver al catálogo</a>
    {loading ? <p role="status">Cargando juego…</p>
      : error ? <div role="alert" className="catalog-message">
        <p>No pudimos cargar el juego. Intentá de nuevo.</p>
        <button type="button" onClick={() => setAttempt(attempt => attempt + 1)}>Reintentar</button>
      </div>
      : !game ? <p role="status">Este juego ya no está disponible en el catálogo.</p>
      : <article className="game-detail">
        <h2>{game.title}</h2>
        <p className="game-publisher">{game.publisher}</p>
        <dl className="game-facts">
          <div><dt>Año de publicación</dt><dd>{game.publicationYear}</dd></div>
          <div><dt>Jugadores</dt><dd>{game.minPlayers === game.maxPlayers ? game.minPlayers : `${game.minPlayers}–${game.maxPlayers}`}</dd></div>
          <div><dt>Duración</dt><dd>{game.durationMin} min</dd></div>
        </dl>
        <h3>Categorías</h3>
        {game.categories.length > 0 ? <ul className="game-categories">
          {game.categories.map(category => <li key={category.id}>{category.name}</li>)}
        </ul> : <p>Sin categorías.</p>}
        <aside
          className="game-actions"
          aria-label={collectionItem ? undefined : 'Acciones de colección'}
          aria-labelledby={collectionItem ? 'game-actions-title' : undefined}
          data-game-id={game.id}
        >
          {collectionItem && <h3 id="game-actions-title">Tu juego</h3>}
          {collectionLoading ? <p role="status">Consultando tu colección…</p>
            : collectionError ? <div role="alert" className="catalog-message">
              <p>No pudimos consultar tu colección.</p>
              <button type="button" onClick={() => setCollectionAttempt(attempt => attempt + 1)}>Reintentar</button>
            </div>
            : <CollectionActions
              userId={user.id}
              gameId={game.id}
              item={collectionItem}
              onChange={setCollectionItem}
              onAcquired={() => removeWishlistAfterAcquisition(game.id)}
            />}
        </aside>
        {!collectionLoading && !collectionError && !collectionItem && <aside className="game-actions" aria-label="Lista de deseos" data-game-id={game.id}>
          {wishlistLoading ? <p role="status">Consultando tus deseos…</p>
            : wishlistError ? <div role="alert" className="catalog-message">
              <p>No pudimos consultar tus deseos.</p>
              <button type="button" onClick={() => setWishlistAttempt(attempt => attempt + 1)}>Reintentar</button>
            </div>
            : <WishlistActions userId={user.id} gameId={game.id} item={wishlistItem} onChange={setWishlistItem} />}
        </aside>}
      </article>}
  </>
}

export default GameDetail
