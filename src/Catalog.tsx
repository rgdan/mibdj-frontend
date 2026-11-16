import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { getCategories, getGames } from './games'
import type { Category, Game } from './games'

function Catalog({ query }: { query: string }) {
  const [games, setGames] = useState<Game[]>([])
  const [categories, setCategories] = useState<Category[]>([])
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
              </article>
            </li>)}
          </ul>
        </>}
    </div>
  </>
}

export default Catalog
