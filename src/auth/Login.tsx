import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { userErrorMessage } from '../api/errors'
import { login } from './auth-api'
import type { User } from '../users/users-api'
import { VALIDATION_MESSAGE } from '../shared/text'

function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const alertRef = useRef<HTMLParagraphElement>(null)
  const request = useRef<AbortController | null>(null)

  useEffect(() => () => request.current?.abort(), [])

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (request.current) return

    const input = event.currentTarget.elements.namedItem('email') as HTMLInputElement
    const email = input.value.trim()
    const invalid = !email ? 'Ingresá tu email.'
      : input.validity.typeMismatch ? 'Ingresá un email válido.' : ''
    setEmailError(invalid)
    if (invalid) {
      setError(VALIDATION_MESSAGE)
      requestAnimationFrame(() => alertRef.current?.focus())
      return
    }
    const controller = new AbortController()
    request.current = controller
    setPending(true)
    setError('')

    try {
      const user = await login(email, controller.signal)
      if (!controller.signal.aborted) onLogin(user)
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(userErrorMessage(error))
        requestAnimationFrame(() => alertRef.current?.focus())
      }
    } finally {
      if (request.current === controller) {
        request.current = null
        if (!controller.signal.aborted) setPending(false)
      }
    }
  }

  return <main className="login-page">
    <div className="login-shell">
      <p className="wordmark" aria-label="MiBDJ">Mi<span>BDJ</span><b>.</b></p>
      <div className="play-table">
        <div className="table-art" aria-hidden="true">
          <svg className="board-route" viewBox="0 0 540 570" fill="none"><path d="M-20 108H165C242 108 240 35 320 35H545M5 380H98C160 380 145 503 223 503H432C497 503 460 410 555 410" /></svg>
          <div className="playing-card card-back"><span className="card-flower">✳</span></div>
          <div className="playing-card card-front"><div className="card-orbit"><span /><span /><span /></div></div>
          <div className="token token-yellow token-top" />
          <div className="token token-red token-bottom" />
          <div className="small-token" />
          <div className="dice"><i /><i /><i /><i /><i /></div>
        </div>

        <section className="access-card" aria-labelledby="access-title">
          <h1 id="access-title">Primero,<br />tu email.</h1>
          <p className="access-description">Tu lugar en la mesa empieza acá.</p>
          <form onSubmit={submit} noValidate aria-busy={pending}>
            {error && <p ref={alertRef} tabIndex={-1} className="form-alert" role="alert">{error}</p>}
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" placeholder="Tu email" spellCheck={false} required disabled={pending} aria-invalid={!!emailError} aria-describedby={emailError ? 'email-error' : undefined} />
            {emailError && <p id="email-error" className="field-error">{emailError}</p>}
            <button type="submit" disabled={pending}>{pending ? 'Entrando…' : 'Entrar'}</button>
          </form>
        </section>
      </div>
    </div>
  </main>
}

export default Login
