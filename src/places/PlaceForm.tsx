import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { userErrorMessage } from '../api/errors'
import { VALIDATION_MESSAGE } from '../shared/text'
import { createPlace, PLACE_TEXT_MAX_LENGTH } from './places-api'
import type { Place } from './places-api'

function PlaceForm({ userId, onCreated }: { userId: number; onCreated: (place: Place) => void }) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [errors, setErrors] = useState<{ name?: string; address?: string }>({})
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [pending, setPending] = useState(false)
  const request = useRef<AbortController | null>(null)
  const alertRef = useRef<HTMLParagraphElement>(null)
  const savedRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => () => request.current?.abort(), [])

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (request.current) return

    const found: typeof errors = {}
    if (!name.trim()) found.name = 'Ingresá el nombre del lugar.'
    else if (name.trim().length > PLACE_TEXT_MAX_LENGTH) found.name = 'El nombre admite hasta 255 caracteres.'
    if (!address.trim()) found.address = 'Ingresá la dirección.'
    else if (address.trim().length > PLACE_TEXT_MAX_LENGTH) found.address = 'La dirección admite hasta 255 caracteres.'
    setErrors(found)
    setError('')
    setSaved('')
    if (Object.keys(found).length > 0) {
      setError(VALIDATION_MESSAGE)
      requestAnimationFrame(() => alertRef.current?.focus())
      return
    }

    const controller = new AbortController()
    request.current = controller
    setPending(true)
    try {
      const place = await createPlace(userId, { name, address }, controller.signal)
      if (controller.signal.aborted) return
      onCreated(place)
      setName('')
      setAddress('')
      setSaved(place.name)
      requestAnimationFrame(() => savedRef.current?.focus())
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(userErrorMessage(error, 'No pudimos conectar con el servidor. Tus datos siguen en el formulario; intentá de nuevo.'))
        requestAnimationFrame(() => alertRef.current?.focus())
      }
    } finally {
      if (request.current === controller) {
        request.current = null
        if (!controller.signal.aborted) setPending(false)
      }
    }
  }

  return <form className="place-form" onSubmit={submit} noValidate aria-busy={pending}>
    {error && <p ref={alertRef} tabIndex={-1} role="alert" className="form-alert">{error}</p>}
    {saved && <p ref={savedRef} tabIndex={-1} role="status">Guardamos «{saved}». Ya podés elegirlo al registrar una partida.</p>}
    <div>
      <label htmlFor="place-name">Nombre</label>
      <input id="place-name" value={name} maxLength={PLACE_TEXT_MAX_LENGTH} required disabled={pending}
        onChange={event => setName(event.target.value)} aria-invalid={!!errors.name}
        aria-describedby={errors.name ? 'place-name-error' : undefined} />
      {errors.name && <p id="place-name-error" className="field-error">{errors.name}</p>}
    </div>
    <div>
      <label htmlFor="place-address">Dirección</label>
      <textarea id="place-address" value={address} maxLength={PLACE_TEXT_MAX_LENGTH} rows={3} required disabled={pending}
        onChange={event => setAddress(event.target.value)} aria-invalid={!!errors.address}
        aria-describedby={errors.address ? 'place-address-error' : undefined} />
      {errors.address && <p id="place-address-error" className="field-error">{errors.address}</p>}
    </div>
    <button type="submit" disabled={pending}>{pending ? 'Guardando…' : 'Guardar lugar'}</button>
  </form>
}

export default PlaceForm
