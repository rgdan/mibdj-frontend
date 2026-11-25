import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { userErrorMessage } from '../api/errors'
import { getGames } from '../catalog/catalog-api'
import type { Game } from '../catalog/catalog-api'
import { NOTES_MAX_LENGTH, createMatch } from './matches-api'
import { getPlaces } from '../places/places-api'
import type { Place } from '../places/places-api'
import { getUsers } from '../users/users-api'
import { plural } from '../shared/text'
import { formatDate, todayIso } from '../shared/dates'
import type { Match } from './matches-api'
import type { User } from '../users/users-api'

type Row = { key: number; userId: number; puntos: string; ganador: boolean }

type Errors = {
  gameId?: string
  placeId?: string
  fecha?: string
  duracion?: string
  notas?: string
  participantes?: string
  puntos?: Record<number, string>
}

const MAX_INT = 2_147_483_647

// Formulario para registrar una partida con sus participantes en un solo POST.
function MatchForm({ user }: { user: User }) {
  const [games, setGames] = useState<Game[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const [gameId, setGameId] = useState('')
  const [placeId, setPlaceId] = useState('')
  const [fecha, setFecha] = useState(todayIso)
  const [duracion, setDuracion] = useState('')
  const [notas, setNotas] = useState('')
  const [rows, setRows] = useState<Row[]>(() => [{ key: 0, userId: user.id, puntos: '', ganador: false }])
  const [toAdd, setToAdd] = useState('')
  const nextKey = useRef(1)

  const [errors, setErrors] = useState<Errors>({})
  const [submitError, setSubmitError] = useState('')
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState<Match | null>(null)
  const request = useRef<AbortController | null>(null)
  const alertRef = useRef<HTMLDivElement>(null)
  const savedRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setLoadError(false)
    Promise.all([getGames('', controller.signal), getPlaces(user.id, controller.signal), getUsers(controller.signal)])
      .then(([games, places, users]) => {
        if (controller.signal.aborted) return
        setGames(games)
        setPlaces(places)
        setUsers(users)
        // Si el usuario tiene un solo lugar, se elige solo
        if (places.length === 1) setPlaceId(current => current || String(places[0].placeId))
      })
      .catch(() => { if (!controller.signal.aborted) setLoadError(true) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [user.id, attempt])

  // Cancela el guardado si se sale de la pantalla
  useEffect(() => () => request.current?.abort(), [])

  useEffect(() => { if (saved) savedRef.current?.focus() }, [saved])

  const selectedGame = games.find(game => String(game.id) === gameId)
  const available = users.filter(candidate => !rows.some(row => row.userId === candidate.id))
  const nameOf = (userId: number) => {
    const name = users.find(candidate => candidate.id === userId)?.name ?? `Usuario #${userId}`
    return userId === user.id ? `${name} (vos)` : name
  }

  function updateRow(key: number, change: Partial<Row>) {
    setRows(rows => rows.map(row => row.key === key ? { ...row, ...change } : row))
  }

  function addParticipant() {
    const userId = Number(toAdd)
    if (!userId || rows.some(row => row.userId === userId)) return
    setRows(rows => [...rows, { key: nextKey.current++, userId, puntos: '', ganador: false }])
    setToAdd('')
    setErrors(errors => ({ ...errors, participantes: undefined }))
  }

  function removeParticipant(key: number) {
    setRows(rows => rows.filter(row => row.key !== key))
  }

  function validate(): Errors {
    const found: Errors = {}
    if (!gameId) found.gameId = 'Elegí un juego.'
    if (!placeId) found.placeId = 'Elegí dónde se jugó.'
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) found.fecha = 'Ingresá una fecha válida.'
    else if (fecha > todayIso()) found.fecha = 'La fecha no puede ser futura.'
    const duration = duracion.trim()
    if (!duration) found.duracion = 'Ingresá la duración en minutos.'
    else if (!/^\d+$/.test(duration) || Number(duration) <= 0) found.duracion = 'La duración debe ser un número entero mayor que 0.'
    else if (Number(duration) > MAX_INT) found.duracion = 'La duración es demasiado grande.'
    if (notas.trim().length > NOTES_MAX_LENGTH) found.notas = `Las notas admiten hasta ${NOTES_MAX_LENGTH} caracteres.`

    if (rows.length === 0) found.participantes = 'Agregá al menos un participante.'
    else if (new Set(rows.map(row => row.userId)).size !== rows.length) found.participantes = 'Hay participantes repetidos.'

    const points: Record<number, string> = {}
    for (const row of rows) {
      const value = row.puntos.trim()
      if (!value) points[row.key] = 'Ingresá los puntos (0 si no sumó).'
      else if (!/^\d+$/.test(value)) points[row.key] = 'Los puntos deben ser un número entero de 0 o más.'
      else if (Number(value) > MAX_INT) points[row.key] = 'El número es demasiado grande.'
    }
    if (Object.keys(points).length > 0) found.puntos = points
    return found
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (request.current) return // ya hay un guardado en curso

    const found = validate()
    setErrors(found)
    setSubmitError('')
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => alertRef.current?.focus())
      return
    }

    const controller = new AbortController()
    request.current = controller
    setPending(true)
    try {
      const match = await createMatch(user.id, {
        gameId: Number(gameId),
        placeId: Number(placeId),
        fecha,
        duracionMin: Number(duracion.trim()),
        notas: notas.trim() || null,
        participantes: rows.map(row => ({ userId: row.userId, puntos: Number(row.puntos.trim()), ganador: row.ganador })),
      }, controller.signal)
      if (!controller.signal.aborted) setSaved(match)
    } catch (error) {
      if (controller.signal.aborted) return
      setSubmitError(userErrorMessage(error, 'No pudimos conectar con el servidor. Tus datos siguen en el formulario; intentá de nuevo.'))
      requestAnimationFrame(() => alertRef.current?.focus())
    } finally {
      if (request.current === controller) {
        request.current = null
        if (!controller.signal.aborted) setPending(false)
      }
    }
  }

  function startAgain() {
    setSaved(null)
    setGameId('')
    setPlaceId(places.length === 1 ? String(places[0].placeId) : '')
    setFecha(todayIso())
    setDuracion('')
    setNotas('')
    setRows([{ key: nextKey.current++, userId: user.id, puntos: '', ganador: false }])
    setErrors({})
  }

  if (loading) return <p role="status">Cargando juegos, lugares y usuarios…</p>

  if (loadError) return <div role="alert" className="catalog-message">
    <p>No pudimos cargar los datos del formulario. Comprobá la conexión e intentá de nuevo.</p>
    <button type="button" onClick={() => setAttempt(attempt => attempt + 1)}>Reintentar</button>
  </div>

  if (saved) {
    const title = games.find(game => game.id === saved.gameId)?.title ?? 'el juego'
    return <div className="match-saved" role="status">
      <h2 ref={savedRef} tabIndex={-1}>Partida registrada</h2>
      <p>Guardamos la partida de {title} del {formatDate(saved.fecha)} con {plural(saved.participantes?.length ?? 0, 'participante')}.</p>
      <div className="saved-actions">
        <a className="button-link" href={`#/partidas/${saved.matchId}`}>Ver detalle</a>
        <a href="#/partidas">Ir al historial</a>
        <button type="button" className="link-button" onClick={startAgain}>Registrar otra partida</button>
      </div>
    </div>
  }

  const hasErrors = Object.keys(errors).length > 0
  const describedBy = (field: keyof Errors) => errors[field] ? `${field}-error` : undefined

  return <>
    <a className="catalog-back" href="#/partidas">Volver al historial</a>

    {places.length === 0 && <p role="status" className="form-notice">
      Todavía no tenés lugares registrados, así que no podés organizar partidas. Igual podés aparecer en las partidas que registren otros usuarios.
    </p>}

    <form className="match-form" onSubmit={submit} noValidate aria-busy={pending}>
      {(submitError || hasErrors) && <div ref={alertRef} tabIndex={-1} role="alert" className="form-alert">
        {submitError || 'Revisá los campos marcados antes de guardar.'}
      </div>}

      <fieldset disabled={pending || places.length === 0}>
        <legend>Datos de la partida</legend>
        <div className="form-grid">
          <div>
            <label htmlFor="match-game">Juego</label>
            <select id="match-game" value={gameId} onChange={event => setGameId(event.target.value)} aria-invalid={!!errors.gameId} aria-describedby={describedBy('gameId') ?? (selectedGame ? 'match-game-hint' : undefined)}>
              <option value="">Elegí un juego</option>
              {games.map(game => <option key={game.id} value={game.id}>{game.title}</option>)}
            </select>
            {errors.gameId && <p id="gameId-error" className="field-error">{errors.gameId}</p>}
            {selectedGame && !errors.gameId && <p id="match-game-hint" className="field-hint">
              Para {selectedGame.minPlayers === selectedGame.maxPlayers ? selectedGame.minPlayers : `${selectedGame.minPlayers}–${selectedGame.maxPlayers}`} jugadores · unos {selectedGame.durationMin} min
            </p>}
          </div>
          <div>
            <label htmlFor="match-place">Lugar</label>
            <select id="match-place" value={placeId} onChange={event => setPlaceId(event.target.value)} aria-invalid={!!errors.placeId} aria-describedby={describedBy('placeId')}>
              <option value="">Elegí un lugar</option>
              {places.map(place => <option key={place.placeId} value={place.placeId}>{place.name}</option>)}
            </select>
            {errors.placeId && <p id="placeId-error" className="field-error">{errors.placeId}</p>}
          </div>
          <div>
            <label htmlFor="match-date">Fecha</label>
            <input id="match-date" type="date" value={fecha} max={todayIso()} onChange={event => setFecha(event.target.value)} aria-invalid={!!errors.fecha} aria-describedby={describedBy('fecha')} />
            {errors.fecha && <p id="fecha-error" className="field-error">{errors.fecha}</p>}
          </div>
          <div>
            <label htmlFor="match-duration">Duración (minutos)</label>
            <input id="match-duration" type="number" inputMode="numeric" min={1} step={1} value={duracion} onChange={event => setDuracion(event.target.value)} aria-invalid={!!errors.duracion} aria-describedby={describedBy('duracion')} />
            {errors.duracion && <p id="duracion-error" className="field-error">{errors.duracion}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="match-notes">Notas <span className="optional">(opcional)</span></label>
          <textarea id="match-notes" rows={3} value={notas} maxLength={NOTES_MAX_LENGTH} onChange={event => setNotas(event.target.value)} aria-invalid={!!errors.notas} aria-describedby={`notes-count${errors.notas ? ' notas-error' : ''}`} />
          <p id="notes-count" className="field-hint">{notas.length} de {NOTES_MAX_LENGTH} caracteres</p>
          {errors.notas && <p id="notas-error" className="field-error">{errors.notas}</p>}
        </div>
      </fieldset>

      <fieldset disabled={pending || places.length === 0}>
        <legend>Participantes</legend>
        <p className="field-hint">Ingresá los puntos de cada jugador y marcá quién ganó. Puede haber varios ganadores (por ejemplo, en un juego cooperativo) o ninguno.</p>
        {errors.participantes && <p id="participantes-error" className="field-error">{errors.participantes}</p>}

        {rows.length > 0 && <ul className="participant-list">
          {rows.map(row => {
            const pointsError = errors.puntos?.[row.key]
            return <li key={row.key}>
              <p className="participant-name">{nameOf(row.userId)}</p>
              <div className="participant-points">
                <label htmlFor={`points-${row.key}`}>Puntos</label>
                <input id={`points-${row.key}`} type="number" inputMode="numeric" min={0} step={1} value={row.puntos} onChange={event => updateRow(row.key, { puntos: event.target.value })} aria-invalid={!!pointsError} aria-describedby={pointsError ? `points-${row.key}-error` : undefined} />
              </div>
              <label className="winner-check">
                <input type="checkbox" checked={row.ganador} onChange={event => updateRow(row.key, { ganador: event.target.checked })} />
                Ganó
              </label>
              <button type="button" className="link-button" onClick={() => removeParticipant(row.key)} aria-label={`Quitar a ${nameOf(row.userId)}`}>Quitar</button>
              {pointsError && <p id={`points-${row.key}-error`} className="field-error">{pointsError}</p>}
            </li>
          })}
        </ul>}

        {selectedGame && rows.length > 0 && (rows.length < selectedGame.minPlayers || rows.length > selectedGame.maxPlayers) && <p className="field-hint" role="status">
          Ojo: {selectedGame.title} es para {selectedGame.minPlayers}–{selectedGame.maxPlayers} jugadores y agregaste {rows.length}.
        </p>}

        <div className="add-participant">
          <div>
            <label htmlFor="participant-add">Agregar participante</label>
            <select id="participant-add" value={toAdd} onChange={event => setToAdd(event.target.value)} disabled={available.length === 0}>
              <option value="">{available.length === 0 ? 'Ya agregaste a todos los usuarios' : 'Elegí un usuario'}</option>
              {available.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
            </select>
          </div>
          <button type="button" onClick={addParticipant} disabled={!toAdd}>Agregar</button>
        </div>
      </fieldset>

      <button type="submit" className="submit-match" disabled={pending || places.length === 0}>{pending ? 'Guardando…' : 'Guardar partida'}</button>
    </form>
  </>
}

export default MatchForm
