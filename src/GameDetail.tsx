import { useEffect, useState } from 'react'
import { getGame } from './games'
import type { Game } from './games'

function GameDetail({ id, query }: { id: string; query: string }) {
  const [game, setGame] = useState<Game | null>(null)
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
        <aside className="game-actions" aria-labelledby="game-actions-title" data-game-id={game.id}>
          <h3 id="game-actions-title">Tu juego</h3>
          <p>Las acciones de colección, deseos y valoración todavía no están disponibles.</p>
        </aside>
      </article>}
  </>
}

export default GameDetail
