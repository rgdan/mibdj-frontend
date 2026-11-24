import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { getCategories, getGames } from './games'
import type { Category, Game } from './games'
import CollectionActions from './CollectionActions'
import { getCollection } from './collection-api'
import type { CollectionItem } from './collection-api'
import type { User } from './session'

function Catalog({ query, user }: { query: string; user: User }) {
  const [games, setGames] = useState<Game[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [collection, setCollection] = useState<CollectionItem[]>([])
  const [collectionLoading, setCollectionLoading] = useState(true)
  const [collectionError, setCollectionError] = useState(false)
  const [collectionAttempt, setCollectionAttempt] = useState(0)
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

  function updateCollection(gameId: number, updated: CollectionItem | null) {
    setCollection(items => updated
      ? items.some(item => item.gameId === gameId)
        ? items.map(item => item.gameId === gameId ? updated : item)
        : [...items, updated]
      : items.filter(item => item.gameId !== gameId))
  }

  function search(event: FormEvent<HTMLFormElement>) {
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
      {collectionError && <div role="alert" className="catalog-message">
        <p>No pudimos consultar tu colección; las acciones de colección están pausadas.</p>
        <button type="button" onClick={() => setCollectionAttempt(attempt => attempt + 1)}>Reintentar</button>
      </div>}
      {loading ? <p role="status">Cargando juegos…</p>
        : error ? <div role="alert" className="catalog-message">
          <p>No pudimos cargar el catálogo. Comprobá la conexión e intentá de nuevo.</p>
          <button type="button" onClick={() => setAttempt(attempt => attempt + 1)}>Reintentar</button>
        </div>
        : games.length === 0 ? <p role="status">{title || categoryId ? 'No encontramos juegos con esos filtros.' : 'Todavía no hay juegos en el catálogo.'}</p>
        : <>
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
                />
              </article>
            </li>)}
          </ul>
        </>}
    </div>
  </>
}

export default Catalog
