import { useEffect, useId, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { userErrorMessage } from '../api/errors'
import { formatDate, todayIso } from '../shared/dates'
import {
  addCollectionItem,
  removeCollectionItem,
  updateCollectionItem,
} from './collection-api'
import type { CollectionItem, CollectionStatus } from './collection-api'

const statuses: { value: CollectionStatus; label: string }[] = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'usado', label: 'Usado' },
  { value: 'prestado', label: 'Prestado' },
]

function CollectionActions({
  userId,
  gameId,
  item,
  disabled = false,
  onChange,
  onAcquired,
}: {
  userId: number
  gameId: number
  item: CollectionItem | null
  disabled?: boolean
  onChange: (item: CollectionItem | null) => void
  onAcquired?: () => Promise<void>
}) {
  const id = useId()
  const [date, setDate] = useState(item?.date ?? todayIso())
  const [status, setStatus] = useState<CollectionStatus>(item?.status ?? 'nuevo')
  const [editing, setEditing] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [cleanupPending, setCleanupPending] = useState(false)
  const [cleanupError, setCleanupError] = useState(false)
  const request = useRef<AbortController | null>(null)

  useEffect(() => {
    setDate(item?.date ?? todayIso())
    setStatus(item?.status ?? 'nuevo')
    setEditing(false)
    setError('')
  }, [item?.date, item?.status, item?.gameId])

  useEffect(() => () => request.current?.abort(), [])

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (request.current || disabled) return

    const controller = new AbortController()
    request.current = controller
    setPending(true)
    setError('')
    try {
      const saved = item
        ? await updateCollectionItem(userId, gameId, { date, status }, controller.signal)
        : await addCollectionItem(userId, gameId, { date, status }, controller.signal)
      if (!controller.signal.aborted) {
        onChange(saved)
        setEditing(false)
        if (!item && onAcquired) {
          setCleanupPending(true)
          setCleanupError(false)
          try {
            await onAcquired()
          } catch {
            setCleanupError(true)
          } finally {
            setCleanupPending(false)
          }
        }
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(userErrorMessage(error))
      }
    } finally {
      if (request.current === controller) {
        request.current = null
        if (!controller.signal.aborted) setPending(false)
      }
    }
  }

  async function retryCleanup() {
    if (!onAcquired || cleanupPending) return
    setCleanupPending(true)
    setCleanupError(false)
    try {
      await onAcquired()
    } catch {
      setCleanupError(true)
    } finally {
      setCleanupPending(false)
    }
  }

  async function remove() {
    if (request.current || disabled) return
    if (!window.confirm(`¿Querés quitar ${item?.title ?? 'este juego'} de tu colección?`)) return

    const controller = new AbortController()
    request.current = controller
    setPending(true)
    setError('')
    try {
      await removeCollectionItem(userId, gameId, controller.signal)
      if (!controller.signal.aborted) onChange(null)
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(userErrorMessage(error))
      }
    } finally {
      if (request.current === controller) {
        request.current = null
        if (!controller.signal.aborted) setPending(false)
      }
    }
  }

  function cancel() {
    setDate(item?.date ?? todayIso())
    setStatus(item?.status ?? 'nuevo')
    setEditing(false)
    setError('')
  }

  return <div className="collection-actions">
    {item && !editing ? <>
      <p className="collection-meta"><span>Estado: {statuses.find(option => option.value === item.status)?.label ?? item.status}</span><span>Desde: {formatDate(item.date)}</span></p>
      <div className="collection-buttons">
        <button type="button" className="link-button" disabled={pending || disabled} onClick={() => setEditing(true)}>Editar</button>
        <button type="button" className="link-button" disabled={pending || disabled} onClick={remove}>{pending ? 'Quitando…' : 'Quitar de la colección'}</button>
      </div>
    </> : !item && !editing ? <button type="button" disabled={pending || disabled} onClick={() => setEditing(true)}>Adquirir</button>
      : <form className="collection-form" onSubmit={submit} aria-busy={pending}>
      <div>
        <label htmlFor={`${id}-date`}>Fecha de adquisición</label>
        <input id={`${id}-date`} type="date" value={date} max={todayIso()} required disabled={pending || disabled} onChange={event => setDate(event.target.value)} />
      </div>
      <div>
        <label htmlFor={`${id}-status`}>Estado</label>
        <select id={`${id}-status`} value={status} required disabled={pending || disabled} onChange={event => setStatus(event.target.value as CollectionStatus)}>
          {statuses.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
      </div>
      <div className="collection-buttons">
        <button type="submit" disabled={pending || disabled}>{pending ? 'Guardando…' : item ? 'Guardar cambios' : 'Confirmar'}</button>
        <button type="button" className="link-button" disabled={pending || disabled} onClick={cancel}>Cancelar</button>
      </div>
    </form>}
    {error && <p className="form-alert" role="alert">{error}</p>}
    {cleanupError && <div className="form-alert" role="alert">
      <p>El juego ya está en tu colección, pero no pudimos quitarlo de tus deseos.</p>
      <button type="button" disabled={cleanupPending || disabled} onClick={() => void retryCleanup()}>
        {cleanupPending ? 'Actualizando…' : 'Reintentar'}
      </button>
    </div>}
  </div>
}

export default CollectionActions
