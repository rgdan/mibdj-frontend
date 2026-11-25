import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { getPersonalRating, savePersonalRating } from './ratings-api'
import type { PersonalRatingData } from './ratings-api'

function PersonalRating({ userId, gameId }: { userId: number; gameId: number }) {
  const [item, setItem] = useState<PersonalRatingData | null>(null)
  const [rating, setRating] = useState('8')
  const [comment, setComment] = useState('')
  const [editing, setEditing] = useState(true)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [queryError, setQueryError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const request = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    request.current = controller
    setItem(null)
    setRating('8')
    setComment('')
    setEditing(true)
    setLoading(true)
    setPending(false)
    setError('')
    setQueryError(false)
    getPersonalRating(userId, gameId, controller.signal)
      .then(saved => {
        if (controller.signal.aborted) return
        setItem(saved)
        if (saved) {
          setRating(String(saved.rating))
          setComment(saved.comment ?? '')
          setEditing(false)
        }
      })
      .catch(error => {
        if (!controller.signal.aborted) {
          setQueryError(true)
          setError(error instanceof Error && !(error instanceof TypeError)
            ? error.message
            : 'No pudimos conectar con el servidor. Intentá de nuevo.')
        }
      })
      .finally(() => {
        if (request.current === controller) request.current = null
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => {
      controller.abort()
      if (request.current === controller) request.current = null
    }
  }, [userId, gameId, attempt])

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (request.current || loading || pending) return

    const value = Number(rating)
    if (!Number.isInteger(value) || value < 1 || value > 10) {
      setError('La valoración debe ser un número entero entre 1 y 10.')
      return
    }

    const controller = new AbortController()
    request.current = controller
    setPending(true)
    setError('')
    try {
      const saved = await savePersonalRating(userId, gameId, value, comment, controller.signal)
      if (!controller.signal.aborted) {
        setItem(saved)
        setRating(String(saved.rating))
        setComment(saved.comment ?? '')
        setEditing(false)
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(error instanceof Error && !(error instanceof TypeError)
          ? error.message
          : 'No pudimos conectar con el servidor. Intentá de nuevo.')
      }
    } finally {
      if (request.current === controller) {
        request.current = null
        if (!controller.signal.aborted) setPending(false)
      }
    }
  }

  function cancel() {
    setRating(String(item?.rating ?? 8))
    setComment(item?.comment ?? '')
    setEditing(false)
    setError('')
  }

  return <section className="personal-rating" aria-labelledby={`personal-rating-title-${gameId}`}>
    <h3 id={`personal-rating-title-${gameId}`}>Tu valoración</h3>
    {loading ? <p role="status">Consultando tu valoración…</p>
      : queryError ? <button type="button" disabled={pending} onClick={() => setAttempt(attempt => attempt + 1)}>Reintentar consulta</button>
      : item && !editing ? <>
        <p><strong>{item.rating}/10</strong></p>
        <p className="rating-comment">{item.comment || 'Sin comentario.'}</p>
        <button type="button" className="link-button" disabled={pending} onClick={() => setEditing(true)}>Editar valoración</button>
      </> : <form className="rating-form" onSubmit={submit} aria-busy={pending}>
        <div>
          <label htmlFor={`personal-rating-value-${gameId}`}>Nota (1 a 10)</label>
          <input
            id={`personal-rating-value-${gameId}`}
            type="number"
            min="1"
            max="10"
            step="1"
            required
            value={rating}
            disabled={pending}
            onChange={event => setRating(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`personal-rating-comment-${gameId}`}>Comentario (opcional)</label>
          <textarea
            id={`personal-rating-comment-${gameId}`}
            maxLength={255}
            rows={3}
            value={comment}
            disabled={pending}
            onChange={event => setComment(event.target.value)}
          />
          <p className="field-hint">{comment.length}/255 caracteres</p>
        </div>
        <div className="collection-buttons">
          <button type="submit" disabled={pending}>{pending ? 'Guardando…' : item ? 'Guardar cambios' : 'Guardar valoración'}</button>
          {item && <button type="button" className="link-button" disabled={pending} onClick={cancel}>Cancelar</button>}
        </div>
      </form>}
    {error && <p className="form-alert" role="alert">{error}</p>}
  </section>
}

export default PersonalRating
