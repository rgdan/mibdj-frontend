import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { getCategories, getGames } from './catalog-api'
import type { Category, Game } from './catalog-api'
import CollectionActions from '../collection/CollectionActions'
import { getCollection } from '../collection/collection-api'
import type { CollectionItem } from '../collection/collection-api'
import WishlistActions from '../wishlist/WishlistActions'
import { getWishlist, getWishlistItem, removeWishlistItem } from '../wishlist/wishlist-api'
import type { WishlistItem } from '../wishlist/wishlist-api'
import type { User } from '../users/users-api'

function Catalog({ query, user }: { query: string; user: User }) {
  const [games, setGames] = useState<Game[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [collection, setCollection] = useState<CollectionItem[]>([])
  const [collectionLoading, setCollectionLoading] = useState(true)
  const [collectionError, setCollectionError] = useState(false)
  const [collectionAttempt, setCollectionAttempt] = useState(0)
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [wishlistLoading, setWishlistLoading] = useState(true)
  const [wishlistError, setWishlistError] = useState(false)
  const [wishlistAttempt, setWishlistAttempt] = useState(0)
  const [wishlistCleanupError, setWishlistCleanupError] = useState(false)
  const [wishlistCleanupAttempt, setWishlistCleanupAttempt] = useState(0)
  const cleanupAttempts = useRef(new Set<number>())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const filters = new URLSearchParams(query)
  const title = filters.get('title') ?? ''
  const categoryId = filters.get('categoryId') ?? ''

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    Promise.all([getGames(query, controller.signal), getCategories(controller.signal)])
      .then(([games, categories]) => {
        if (controller.signal.aborted) return
        setGames(games)
        setCategories(categories)
      })
      .catch(() => { if (!controller.signal.aborted) setError(true) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [query, attempt])

  useEffect(() => {
    const controller = new AbortController()
    setCollectionLoading(true)
    setCollectionError(false)
    getCollection(user.id, controller.signal)
      .then(items => { if (!controller.signal.aborted) setCollection(items) })
      .catch(() => { if (!controller.signal.aborted) setCollectionError(true) })
      .finally(() => { if (!controller.signal.aborted) setCollectionLoading(false) })
    return () => controller.abort()
  }, [user.id, collectionAttempt])

  useEffect(() => {
    const controller = new AbortController()
    setWishlist([])
    setWishlistLoading(true)
    setWishlistError(false)
    getWishlist(user.id, controller.signal)
      .then(items => { if (!controller.signal.aborted) setWishlist(items) })
      .catch(() => { if (!controller.signal.aborted) setWishlistError(true) })
      .finally(() => { if (!controller.signal.aborted) setWishlistLoading(false) })
    return () => controller.abort()
  }, [user.id, wishlistAttempt])

  useEffect(() => {
    if (collectionLoading || collectionError || wishlistLoading || wishlistError) return

    const ownedIds = new Set(collection.map(item => item.gameId))
    const duplicates = wishlist.filter(item => ownedIds.has(item.gameId)
      && !cleanupAttempts.current.has(item.gameId))
    if (duplicates.length === 0) return

    const controller = new AbortController()
    duplicates.forEach(item => cleanupAttempts.current.add(item.gameId))
    Promise.all(duplicates.map(async item => {
      try {
        await removeWishlistItem(user.id, item.gameId, controller.signal)
        return item.gameId
      } catch {
        return null
      }
    })).then(removedIds => {
      if (controller.signal.aborted) return
      const removed = removedIds.filter((gameId): gameId is number => gameId !== null)
      if (removed.length > 0) {
        setWishlist(items => items.filter(item => !removed.includes(item.gameId)))
      }
      setWishlistCleanupError(removed.length !== duplicates.length)
    })
    return () => controller.abort()
  }, [collection, collectionError, collectionLoading, user.id, wishlist, wishlistError, wishlistLoading, wishlistCleanupAttempt])

  function updateCollection(gameId: number, updated: CollectionItem | null) {
    setCollection(items => updated
      ? items.some(item => item.gameId === gameId)
        ? items.map(item => item.gameId === gameId ? updated : item)
        : [...items, updated]
      : items.filter(item => item.gameId !== gameId))
  }

  function updateWishlist(gameId: number, updated: WishlistItem | null) {
    setWishlist(items => updated
      ? items.some(item => item.gameId === gameId)
        ? items.map(item => item.gameId === gameId ? updated : item)
        : [...items, updated]
      : items.filter(item => item.gameId !== gameId))
  }

  async function removeWishlistAfterAcquisition(gameId: number) {
    const controller = new AbortController()
    const wishlistItem = await getWishlistItem(user.id, gameId, controller.signal)
    if (wishlistItem) await removeWishlistItem(user.id, gameId, controller.signal)
    setWishlist(items => items.filter(item => item.gameId !== gameId))
    setWishlistCleanupError(false)
  }

  function retryWishlistCleanup() {
    const ownedIds = new Set(collection.map(item => item.gameId))
    wishlist.filter(item => ownedIds.has(item.gameId))
      .forEach(item => cleanupAttempts.current.delete(item.gameId))
    setWishlistCleanupError(false)
    setWishlistCleanupAttempt(attempt => attempt + 1)
  }

  function search(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const next = new URLSearchParams()
    const title = String(data.get('title') ?? '').trim()
    const categoryId = String(data.get('categoryId') ?? '')
    if (title) next.set('title', title)
    if (categoryId) next.set('categoryId', categoryId)
    const nextQuery = next.toString()
    if (nextQuery === query) setAttempt(attempt => attempt + 1)
    else window.location.hash = `/catalogo${nextQuery ? `?${nextQuery}` : ''}`
  }

  return <>
    <form className="catalog-filters" onSubmit={search} key={query}>
      <div>
        <label htmlFor="game-title">Buscar por título</label>
        <input id="game-title" name="title" type="search" defaultValue={title} placeholder="Nombre del juego" />
      </div>
      <div>
        <label htmlFor="game-category">Categoría</label>
        <select id="game-category" name="categoryId" defaultValue={categoryId} key={`${query}:${categories.length}`} disabled={categories.length === 0}>
          <option value="">Todas las categorías</option>
          {categoryId && !categories.some(category => String(category.id) === categoryId) && <option value={categoryId}>Categoría no disponible</option>}
          {categories.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}
        </select>
      </div>
      <button type="submit">Buscar</button>
      {(title || categoryId) && <a href="#/catalogo">Quitar filtros</a>}
    </form>

    <div aria-busy={loading}>
      {loading ? <p role="status">Cargando juegos…</p>
        : error ? <div role="alert" className="catalog-message">
          <p>No pudimos cargar el catálogo. Comprobá la conexión e intentá de nuevo.</p>
          <button type="button" onClick={() => setAttempt(attempt => attempt + 1)}>Reintentar</button>
        </div>
        : games.length === 0 ? <p role="status">{title || categoryId ? 'No encontramos juegos con esos filtros.' : 'Todavía no hay juegos en el catálogo.'}</p>
        : <>
          {collectionError && <div role="alert" className="catalog-message">
            <p>No pudimos consultar tu colección; las acciones de colección están pausadas.</p>
            <button type="button" onClick={() => setCollectionAttempt(attempt => attempt + 1)}>Reintentar</button>
          </div>}
          {wishlistError && <div role="alert" className="catalog-message">
            <p>No pudimos consultar tu lista de deseos; sus acciones están pausadas.</p>
            <button type="button" onClick={() => setWishlistAttempt(attempt => attempt + 1)}>Reintentar</button>
          </div>}
          {wishlistCleanupError && <div role="alert" className="catalog-message">
            <p>Un juego de tu colección también aparece en deseos y no pudimos quitarlo automáticamente.</p>
            <button type="button" onClick={retryWishlistCleanup}>Reintentar</button>
          </div>}
          <p className="catalog-count" role="status">{games.length} {games.length === 1 ? 'juego' : 'juegos'}</p>
          <ul className="game-list">
            {games.map(game => <li key={game.id}>
              <article>
                <h2><a href={`#/catalogo/${game.id}${query ? `?${query}` : ''}`}>{game.title}</a></h2>
                <p className="game-publisher">{game.publisher}</p>
                <p>{game.minPlayers === game.maxPlayers ? game.minPlayers : `${game.minPlayers}–${game.maxPlayers}`} jugadores · {game.durationMin} min</p>
                <ul className="game-categories" aria-label={`Categorías de ${game.title}`}>
                  {game.categories.map(category => <li key={category.id}>{category.name}</li>)}
                </ul>
                <CollectionActions
                  userId={user.id}
                  gameId={game.id}
                  item={collection.find(item => item.gameId === game.id) ?? null}
                  disabled={collectionLoading || collectionError}
                  onChange={updated => updateCollection(game.id, updated)}
                  onAcquired={() => removeWishlistAfterAcquisition(game.id)}
                />
                {!collectionLoading && !collectionError && !collection.some(item => item.gameId === game.id)
                  && <WishlistActions
                    userId={user.id}
                    gameId={game.id}
                    item={wishlist.find(item => item.gameId === game.id) ?? null}
                    disabled={wishlistLoading || wishlistError}
                    onChange={updated => updateWishlist(game.id, updated)}
                  />}
              </article>
            </li>)}
          </ul>
        </>}
    </div>
  </>
}

export default Catalog
