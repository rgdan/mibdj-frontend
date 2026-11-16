import { useEffect, useRef, useState } from 'react'
import Login from './Login'
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
  const page = pages.find((page) => page.path === path)

  useEffect(() => {
    const onHashChange = () => setPath(window.location.hash.slice(1) || '/catalogo')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    document.title = `${user ? page?.title ?? 'Página no encontrada' : 'Acceso'} · MiBDJ`
    if (user) heading.current?.focus()
  }, [user, path, page])

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

  return <main className="login-page" key={user.id}>
    <div className="login-shell">
      <p className="wordmark" aria-label="MiBDJ">Mi<span>BDJ</span><b>.</b></p>
      <div className="session-bar">
        <p className="active-user">{user.name}</p>
        <button className="logout-button" type="button" onClick={logout}>Salir</button>
      </div>
      <nav className="app-nav" aria-label="Secciones">
        {pages.map((page) => <a key={page.path} href={`#${page.path}`} aria-current={path === page.path ? 'page' : undefined}>{page.title}</a>)}
      </nav>
      <section className="section-page" aria-labelledby="section-title">
        <h1 id="section-title" ref={heading} tabIndex={-1}>{page?.title ?? 'Página no encontrada'}</h1>
        <p>{page ? 'Todavía no disponible.' : 'Esta dirección no corresponde a ninguna sección.'}</p>
        {!page && <a href="#/catalogo">Volver al catálogo</a>}
      </section>
    </div>
  </main>
}

export default App
