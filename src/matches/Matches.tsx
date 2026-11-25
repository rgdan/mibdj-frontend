import { useEffect, useState } from 'react'
import { getMatches, plural } from './matches'
import { formatDate } from '../shared/dates'
import type { Match } from './matches'
import type { User } from '../auth/session'

// Historial: partidas que el usuario organizó o en las que participó.
function Matches({ user }: { user: User }) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    getMatches(user.id, controller.signal)
      .then(matches => { if (!controller.signal.aborted) setMatches(matches) })
      .catch(() => { if (!controller.signal.aborted) setError(true) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [user.id, attempt])

  return <>
    <div className="section-actions">
      <p>Las partidas que organizaste o en las que participaste, de la más reciente a la más antigua.</p>
      <a className="button-link" href="#/partidas/nueva">Registrar partida</a>
    </div>

    <div aria-busy={loading}>
      {loading ? <p role="status">Cargando partidas…</p>
        : error ? <div role="alert" className="catalog-message">
          <p>No pudimos cargar el historial. Comprobá la conexión e intentá de nuevo.</p>
          <button type="button" onClick={() => setAttempt(attempt => attempt + 1)}>Reintentar</button>
        </div>
        : matches.length === 0 ? <p role="status">Todavía no tenés partidas registradas. Cuando registres una, o cuando alguien te agregue como participante, aparecerá acá.</p>
        : <>
          <p className="catalog-count" role="status">{plural(matches.length, 'partida')}</p>
          <ul className="game-list match-list">
            {matches.map(match => <li key={match.matchId}>
              <article>
                <h2><a href={`#/partidas/${match.matchId}`}>{match.gameTitle ?? 'Juego sin título'}</a></h2>
                <p className="match-meta">
                  <span>{formatDate(match.fecha)}</span>
                  <span>{match.placeName ?? 'Sin lugar'}</span>
                  <span>{plural(match.participantesCount ?? 0, 'participante')}</span>
                </p>
                <p className="match-role">{match.userId === user.id ? 'Organizaste esta partida' : 'Participaste como invitado'}</p>
              </article>
            </li>)}
          </ul>
        </>}
    </div>
  </>
}

export default Matches
