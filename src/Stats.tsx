import { useEffect, useState } from 'react'
import { getStats } from './matches'
import type { UserStats } from './matches'
import type { User } from './session'

const decimal = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 1 })

// Estadísticas del usuario: juegos más jugados, duración promedio y compañeros frecuentes.
function Stats({ user }: { user: User }) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    getStats(user.id, controller.signal)
      .then(stats => { if (!controller.signal.aborted) setStats(stats) })
      .catch(() => { if (!controller.signal.aborted) setError(true) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [user.id, attempt])

  const empty = stats && stats.mostPlayedGames.length === 0
    && stats.averageDurationByGame.length === 0
    && stats.frequentCompanions.length === 0

  return <div aria-busy={loading}>
    <p>Se calculan con las partidas en las que jugaste. Las que solo organizaste, sin estar en la lista de participantes, no se cuentan.</p>

    {loading ? <p role="status">Cargando estadísticas…</p>
      : error || !stats ? <div role="alert" className="catalog-message">
        <p>No pudimos cargar tus estadísticas. Comprobá la conexión e intentá de nuevo.</p>
        <button type="button" onClick={() => setAttempt(attempt => attempt + 1)}>Reintentar</button>
      </div>
      : empty ? <div role="status" className="stats-empty">
        <p>Todavía no tenés actividad. Cuando juegues tu primera partida, acá vas a ver tus juegos favoritos y con quién jugás más.</p>
        <a className="button-link" href="#/partidas/nueva">Registrar partida</a>
      </div>
      : <>
        <section className="stats-block" aria-labelledby="stats-played">
          <h2 id="stats-played">Juegos más jugados</h2>
          <p className="field-hint">Cantidad de partidas que jugaste de cada juego, de más a menos.</p>
          {stats.mostPlayedGames.length === 0 ? <p>Sin datos todavía.</p>
            : <table className="data-table">
              <thead><tr><th scope="col">Juego</th><th scope="col" className="number">Partidas jugadas</th></tr></thead>
              <tbody>
                {stats.mostPlayedGames.map(item => <tr key={item.gameId}>
                  <th scope="row"><a href={`#/catalogo/${item.gameId}`}>{item.gameTitle}</a></th>
                  <td className="number">{item.matchesPlayed}</td>
                </tr>)}
              </tbody>
            </table>}
        </section>

        <section className="stats-block" aria-labelledby="stats-duration">
          <h2 id="stats-duration">Duración promedio por juego</h2>
          <p className="field-hint">Cuánto duraron en promedio tus partidas de cada juego, en minutos.</p>
          {stats.averageDurationByGame.length === 0 ? <p>Sin datos todavía.</p>
            : <table className="data-table">
              <thead><tr><th scope="col">Juego</th><th scope="col" className="number">Promedio (min)</th></tr></thead>
              <tbody>
                {stats.averageDurationByGame.map(item => <tr key={item.gameId}>
                  <th scope="row"><a href={`#/catalogo/${item.gameId}`}>{item.gameTitle}</a></th>
                  <td className="number">{decimal.format(item.averageDurationMin)} min</td>
                </tr>)}
              </tbody>
            </table>}
        </section>

        <section className="stats-block" aria-labelledby="stats-companions">
          <h2 id="stats-companions">Compañeros más frecuentes</h2>
          <p className="field-hint">Con quién compartiste más partidas. Cada partida cuenta una vez por compañero.</p>
          {stats.frequentCompanions.length === 0 ? <p>Todavía no jugaste con otras personas.</p>
            : <table className="data-table">
              <thead><tr><th scope="col">Compañero</th><th scope="col" className="number">Partidas juntos</th></tr></thead>
              <tbody>
                {stats.frequentCompanions.map(item => <tr key={item.userId}>
                  <th scope="row">{item.userName}</th>
                  <td className="number">{item.sharedMatches}</td>
                </tr>)}
              </tbody>
            </table>}
        </section>
      </>}
  </div>
}

export default Stats
