import { useEffect, useState } from 'react'
import { formatDate, getMatch, getUsers, joinNames, plural } from './matches'
import type { Match } from './matches'
import type { User } from './session'

// Detalle de una partida: datos generales, puntos de cada participante y ganadores.
function MatchDetail({ id, user }: { id: string; user: User }) {
  const [match, setMatch] = useState<Match | null>(null)
  const [names, setNames] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    Promise.all([
      getMatch(user.id, id, controller.signal),
      // Si fallan los nombres, igual se muestra la partida con los IDs
      getUsers(controller.signal).catch(() => [] as User[]),
    ])
      .then(([match, users]) => {
        if (controller.signal.aborted) return
        setMatch(match)
        setNames(new Map(users.map(user => [user.id, user.name])))
      })
      .catch(() => { if (!controller.signal.aborted) setError(true) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [id, user.id, attempt])

  function nameOf(userId: number) {
    const name = names.get(userId) ?? `Usuario #${userId}`
    return userId === user.id ? `${name} (vos)` : name
  }

  const participants = match?.participantes ?? []
  const winners = participants.filter(participant => participant.ganador)

  return <>
    <a className="catalog-back" href="#/partidas">Volver al historial</a>
    {loading ? <p role="status">Cargando partida…</p>
      : error ? <div role="alert" className="catalog-message">
        <p>No pudimos cargar la partida. Intentá de nuevo.</p>
        <button type="button" onClick={() => setAttempt(attempt => attempt + 1)}>Reintentar</button>
      </div>
      : !match ? <p role="status">Esta partida no existe o no participaste en ella.</p>
      : <article className="game-detail match-detail">
        <h2>{match.gameTitle ?? 'Juego sin título'}</h2>
        <p className="game-publisher">Organizada por {nameOf(match.userId)}</p>
        <dl className="game-facts match-facts">
          <div><dt>Fecha</dt><dd>{formatDate(match.fecha)}</dd></div>
          <div><dt>Lugar</dt><dd>{match.placeName ?? 'Sin lugar'}</dd></div>
          <div><dt>Duración</dt><dd>{match.duracionMin} min</dd></div>
        </dl>

        <h3>Notas</h3>
        <p className="match-notes">{match.notas?.trim() ? match.notas : 'Sin notas.'}</p>

        <h3>Resultado</h3>
        <p className="match-result">
          {winners.length === 0 ? 'Nadie ganó esta partida.'
            : winners.length === participants.length && participants.length > 1 ? `Ganaron todos: ${joinNames(winners.map(w => nameOf(w.userId)))}.`
            : `${winners.length === 1 ? 'Ganó' : 'Ganaron'} ${joinNames(winners.map(w => nameOf(w.userId)))}.`}
        </p>

        <h3>Participantes</h3>
        {participants.length === 0 ? <p>Esta partida no tiene participantes registrados.</p>
          : <table className="data-table">
            <caption className="visually-hidden">Puntos de cada participante ({plural(participants.length, 'participante')})</caption>
            <thead>
              <tr><th scope="col">Jugador</th><th scope="col" className="number">Puntos</th><th scope="col">Resultado</th></tr>
            </thead>
            <tbody>
              {participants.map(participant => <tr key={participant.userId}>
                <th scope="row">{nameOf(participant.userId)}</th>
                <td className="number">{participant.puntos}</td>
                <td>{participant.ganador ? <span className="winner-badge">Ganó</span> : 'No ganó'}</td>
              </tr>)}
            </tbody>
          </table>}
      </article>}
  </>
}

export default MatchDetail
