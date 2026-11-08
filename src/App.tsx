import type { MouseEvent } from 'react'
import './styles.css'

function focusAccess(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
  const input = document.getElementById('username')
  input?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    block: 'center',
  })
  input?.focus({ preventScroll: true })
}

function Dice({ className = '' }: { className?: string }) {
  return <div className={`dice ${className}`} aria-hidden="true">
    <i /><i /><i /><i /><i />
  </div>
}

function App() {
  return <>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <header className="site-header wrap" id="inicio">
      <a className="wordmark" href="#inicio" aria-label="MiBDJ, inicio">Mi<span>BDJ</span><b>.</b></a>
      <nav aria-label="Navegación principal">
        <a className="text-link" href="#que-es">Qué es MiBDJ</a>
        <a className="button button-small" href="#acceso" onClick={focusAccess}>Entrar <span aria-hidden="true">↗</span></a>
      </nav>
    </header>

    <main id="contenido">
      <section className="hero wrap" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">Todo lo que<br /><span className="headline-play">jugás,</span> en un<br />mismo lugar.</h1>
          <p>Los juegos que tenés. Los que querés probar.<br className="desktop-break" /> Y esas partidas que merecen quedar anotadas.</p>
          <a className="button hero-cta" href="#acceso" onClick={focusAccess}>Acercate a la mesa <span aria-hidden="true">↗</span></a>
          <div className="hero-note"><span className="tiny-token" aria-hidden="true" /> Tu colección tiene mucho por contar.</div>
        </div>

        <div className="play-table">
          <div className="table-art" aria-hidden="true">
            <svg className="board-route" viewBox="0 0 540 570" fill="none"><path d="M-20 108H165C242 108 240 35 320 35H545M5 380H98C160 380 145 503 223 503H432C497 503 460 410 555 410" /></svg>
            <div className="playing-card card-back"><span className="card-flower">✳</span></div>
            <div className="playing-card card-front"><div className="card-orbit"><span /><span /><span /></div></div>
            <div className="token token-yellow token-top" />
            <div className="token token-red token-bottom" />
            <div className="small-token" />
            <Dice className="hero-dice" />
            <span className="table-caption">Siempre hay otra partida.</span>
          </div>

          <section className="access-card" id="acceso" aria-labelledby="access-title">
            <div className="access-label"><span aria-hidden="true" /> Vista previa del acceso</div>
            <h2 id="access-title">Primero,<br />tu nombre.</h2>
            <p>Tu lugar en la mesa empieza acá.</p>
            <form onSubmit={(event) => event.preventDefault()} aria-describedby="access-notice">
              <label htmlFor="username">Nombre de usuario</label>
              <input id="username" name="username" type="text" autoComplete="username" placeholder="Tu usuario" spellCheck={false} />
              <button type="submit" disabled>Entrar</button>
              <p className="access-notice" id="access-notice">El acceso aún no está habilitado.</p>
            </form>
          </section>
        </div>
      </section>

      <section className="features wrap" id="que-es" aria-labelledby="features-title">
        <div className="section-heading">
          <p>Un espacio para tu hobby</p>
          <h2 id="features-title">Fuera de la caja.<br />Dentro de MiBDJ.</h2>
        </div>
        <div className="feature-layout">
          <article className="collection-feature">
            <div className="collection-art" aria-hidden="true">
              <div className="mini-box box-green"><span /><span /><span /></div>
              <div className="mini-box box-red"><div /></div>
              <div className="mini-box box-paper"><svg viewBox="0 0 100 100"><path d="m50 8 36 21v42L50 92 14 71V29Z" /><path d="m14 29 36 22 36-22M50 51v41" /></svg></div>
              <div className="shelf-line" />
            </div>
            <div className="collection-copy">
              <h3>Tu próxima partida<br />ya está en la estantería.</h3>
              <p>Reuní tu colección y llevá una lista de esos juegos que te faltan. Para saber qué hay en casa y qué sigue después.</p>
              <span className="feature-caption">Colección y lista de deseos</span>
            </div>
          </article>
          <div className="feature-rows">
            <article>
              <span className="feature-symbol symbol-score" aria-hidden="true"><i /><i /><i /></span>
              <div><h3>Que no se pierda<br />la última partida.</h3><p>Con quién jugaste, dónde, cuánto duró y cómo terminó. Los resultados pasan; las buenas historias quedan.</p><span className="feature-caption">Partidas, lugares y resultados</span></div>
            </article>
            <article>
              <span className="feature-symbol symbol-rating" aria-hidden="true">✳</span>
              <div><h3>Descubrí lo que<br />te hace volver a jugar.</h3><p>Guardá tus valoraciones y mirá qué juegos vuelven más a la mesa y con quién compartís más partidas.</p><span className="feature-caption">Valoraciones y actividad</span></div>
            </article>
          </div>
        </div>
      </section>
    </main>

    <footer className="site-footer wrap">
      <div><a className="wordmark" href="#inicio" aria-label="MiBDJ, volver al inicio">Mi<span>BDJ</span><b>.</b></a><p>Mi base de datos de juegos de mesa.</p></div>
      <a className="back-top" href="#inicio">Volver arriba <span aria-hidden="true">↑</span></a>
    </footer>
  </>
}

export default App
