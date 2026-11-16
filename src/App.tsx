import './styles.css'

function App() {
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
          <h1 id="access-title">Primero,<br />tu nombre.</h1>
          <p className="access-description">Tu lugar en la mesa empieza acá.</p>
          <form onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="username">Nombre de usuario</label>
            <input id="username" name="username" type="text" autoComplete="username" placeholder="Tu usuario" spellCheck={false} />
            <button type="submit" disabled>Entrar</button>
          </form>
        </section>
      </div>
    </div>
  </main>
}

export default App
