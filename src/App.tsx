import { useEffect, useRef, useState } from 'react'
import Login from './Login'
import Catalog from './Catalog'
import GameDetail from './GameDetail'
import Matches from './Matches.tsx'
import MatchDetail from './MatchDetail'
import MatchForm from './MatchForm'
import Stats from './Stats'
import type { User } from './session'
import './styles.css'

const pages = [
  { path: '/catalogo', title: 'Catálogo' },
  { path: '/coleccion', title: 'Colección' },
  { path: '/deseos', title: 'Deseos' },
  { path: '/partidas', title: 'Partidas' },
  { path: '/estadisticas', title: 'Estadísticas' },
]

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [path, setPath] = useState(() => window.location.hash.slice(1) || '/catalogo')
  const heading = useRef<HTMLHeadingElement>(null)
  const [route, query = ''] = path.split('?')
  const gameId = route.match(/^\/catalogo\/([1-9]\d*)$/)?.[1]
  const matchId = route.match(/^\/partidas\/([1-9]\d*)$/)?.[1]
  const newMatch = route === '/partidas/nueva'
  const page = pages.find((page) => page.path === (gameId ? '/catalogo' : matchId || newMatch ? '/partidas' : route))
  const title = gameId ? 'Detalle del juego'
    : matchId ? 'Detalle de la partida'
    : newMatch ? 'Registrar partida'
    : page?.title ?? 'Página no encontrada'

  useEffect(() => {
    const onHashChange = () => setPath(window.location.hash.slice(1) || '/catalogo')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    document.title = `${user ? title : 'Acceso'} · MiBDJ`
    if (user) heading.current?.focus()
  }, [user, path, title])

  function enter(user: User) {
    setUser(user)
    setPath('/catalogo')
    window.location.hash = '/catalogo'
  }

  function logout() {
    setUser(null)
    setPath('/catalogo')
    window.location.hash = '/'
  }

  if (!user) return <Login onLogin={enter} />

  return <main className="app-page" key={user.id}>
    <div className="app-shell">
      <p className="wordmark" aria-label="MiBDJ">Mi<span>BDJ</span><b>.</b></p>
      <div className="session-bar">
        <p className="active-user">{user.name}</p>
        <button className="logout-button" type="button" onClick={logout}>Salir</button>
      </div>
      <nav className="app-nav" aria-label="Secciones">
        {pages.map(link => <a key={link.path} href={`#${link.path}`} aria-current={page?.path === link.path ? 'page' : undefined}>{link.title}</a>)}
      </nav>
      <section className="section-page" aria-labelledby="section-title">
        <h1 id="section-title" ref={heading} tabIndex={-1}>{title}</h1>
        {gameId ? <GameDetail key={gameId} id={gameId} query={query} />
          : route === '/catalogo' ? <Catalog query={query} />
          : matchId ? <MatchDetail key={matchId} id={matchId} user={user} />
          : newMatch ? <MatchForm user={user} />
          : route === '/partidas' ? <Matches user={user} />
          : route === '/estadisticas' ? <Stats user={user} />
          : <p>{page ? 'Todavía no disponible.' : 'Esta dirección no corresponde a ninguna sección.'}</p>}
        {!page && <a href="#/catalogo">Volver al catálogo</a>}
      </section>
    </div>
  </main>
}

export default App
