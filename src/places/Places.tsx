import { useEffect, useState } from 'react'
import type { User } from '../users/users-api'
import { getPlaces } from './places-api'
import type { Place } from './places-api'
import PlaceForm from './PlaceForm'

function Places({ user }: { user: User }) {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    getPlaces(user.id, controller.signal)
      .then(places => { if (!controller.signal.aborted) setPlaces(places) })
      .catch(() => { if (!controller.signal.aborted) setError(true) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [user.id, attempt])

  function addPlace(place: Place) {
    setPlaces(places => [...places, place].sort((a, b) => a.name.localeCompare(b.name, 'es')))
  }

  if (loading) return <p role="status">Cargando tus lugares…</p>
  if (error) return <div role="alert" className="catalog-message">
    <p>No pudimos cargar tus lugares. Comprobá la conexión e intentá de nuevo.</p>
    <button type="button" onClick={() => setAttempt(attempt => attempt + 1)}>Reintentar</button>
  </div>

  return <>
    <p>Guardá los lugares donde jugás para elegirlos al registrar una partida.</p>
    <section aria-labelledby="create-place-title">
      <h2 id="create-place-title">Crear lugar</h2>
      <PlaceForm key={user.id} userId={user.id} onCreated={addPlace} />
    </section>
    <section className="places-list" aria-labelledby="places-list-title">
      <h2 id="places-list-title">Tus lugares</h2>
      {places.length === 0 ? <p role="status">Todavía no tenés lugares registrados. Creá el primero con el formulario.</p>
        : <ul className="game-list">
          {places.map(place => <li key={place.placeId}>
            <article>
              <h3>{place.name}</h3>
              <p>{place.address}</p>
            </article>
          </li>)}
        </ul>}
    </section>
  </>
}

export default Places
