import { useEffect, useRef, useState } from 'react'
import { userErrorMessage } from '../api/errors'
import { addWishlistItem, removeWishlistItem, updateWishlistItem } from './wishlist-api'
import type { WishlistItem, WishlistPriority } from './wishlist-api'

const priorities: { value: WishlistPriority; label: string }[] = [
  { value: 3, label: 'Alta' },
  { value: 2, label: 'Media' },
  { value: 1, label: 'Baja' },
]

function WishlistActions({
  userId,
  gameId,
  item,
  disabled = false,
  owned = false,
  onChange,
}: {
  userId: number
  gameId: number
  item: WishlistItem | null
  disabled?: boolean
  owned?: boolean
  onChange: (item: WishlistItem | null) => void
}) {
  const [priority, setPriority] = useState<WishlistPriority>(item?.priority ?? 2)
  const [editing, setEditing] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const request = useRef<AbortController | null>(null)

  useEffect(() => {
    setPriority(item?.priority ?? 2)
    setEditing(false)
    setError('')
  }, [item?.gameId, item?.priority])

  useEffect(() => () => request.current?.abort(), [])

  if (owned) return null

  async function save() {
    if (request.current || disabled) return

    const controller = new AbortController()
    request.current = controller
    setPending(true)
    setError('')
    try {
      const saved = item
        ? await updateWishlistItem(userId, gameId, priority, controller.signal)
        : await addWishlistItem(userId, gameId, priority, controller.signal)
      if (!controller.signal.aborted) {
        onChange(saved)
        setEditing(false)
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

  async function remove() {
    if (request.current || disabled) return
    if (!window.confirm(`¿Querés quitar ${item?.title ?? 'este juego'} de tus deseos?`)) return
    const controller = new AbortController()
    request.current = controller
    setPending(true)
    setError('')
    try {
      await removeWishlistItem(userId, gameId, controller.signal)
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
    setPriority(item?.priority ?? 2)
    setEditing(false)
    setError('')
  }

  return <div className="wishlist-actions">
    {item && !editing ? <>
      <p className="wishlist-meta">Deseo · Prioridad {priorities.find(option => option.value === item.priority)?.label ?? item.priority}</p>
      <div className="collection-buttons">
        <button type="button" className="link-button" disabled={pending || disabled} onClick={() => setEditing(true)}>Cambiar prioridad</button>
        <button type="button" className="link-button" disabled={pending || disabled} onClick={remove}>{pending ? 'Quitando…' : 'Quitar de deseos'}</button>
      </div>
    </> : !item && !editing
      ? <button type="button" disabled={pending || disabled} onClick={() => setEditing(true)}>Agregar a deseos</button>
      : <form className="wishlist-form" onSubmit={event => { event.preventDefault(); void save() }} aria-busy={pending}>
        <div>
          <label htmlFor={`wishlist-priority-${gameId}`}>Prioridad</label>
          <select
            id={`wishlist-priority-${gameId}`}
            value={priority}
            disabled={pending || disabled}
            onChange={event => setPriority(Number(event.target.value) as WishlistPriority)}
          >
            {priorities.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </div>
        <div className="collection-buttons">
          <button type="submit" disabled={pending || disabled}>{pending ? 'Guardando…' : item ? 'Guardar prioridad' : 'Confirmar'}</button>
          <button type="button" className="link-button" disabled={pending || disabled} onClick={cancel}>Cancelar</button>
        </div>
      </form>}
    {error && <p className="form-alert" role="alert">{error}</p>}
  </div>
}

export default WishlistActions
