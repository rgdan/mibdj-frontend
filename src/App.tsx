import { useState } from 'react'
import Login from './Login'
import type { User } from './session'
import './styles.css'

function App() {
  const [user, setUser] = useState<User | null>(null)

  if (!user) return <Login onLogin={setUser} />

  return <main className="login-page" key={user.id}>
    <div className="login-shell">
      <p className="wordmark" aria-label="MiBDJ">Mi<span>BDJ</span><b>.</b></p>
      <p className="active-user">{user.name}</p>
    </div>
  </main>
}

export default App
