import React, { useState } from 'react'

// 🔧 Usuarios y contraseñas — modificar acá para agregar/cambiar accesos
const USERS = [
  { user: 'royal',  pass: 'royal2026' },
  { user: 'paula',  pass: 'marketing' },
  { user: 'admin',  pass: 'dashboard' },
]

function RoyalLogoLogin() {
  return (
    <svg width="52" height="54" viewBox="0 0 100 105" fill="none">
      {/* Cuerpo verde */}
      <path d="M12 6 H58 Q88 6 88 33 Q88 58 60 60 L12 60 Z" fill="#95C11F"/>
      {/* Pata diagonal */}
      <polygon points="28,56 52,56 82,99 58,99" fill="#95C11F"/>
      {/* Corte diagonal negro */}
      <polygon points="38,6 62,6 38,60 14,60" fill="#1C1C1B"/>
    </svg>
  )
}

export default function Login({ onLogin }) {
  const [user, setUser]   = useState('')
  const [pass, setPass]   = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(false)
    setTimeout(() => {
      const match = USERS.find(u => u.user === user.trim().toLowerCase() && u.pass === pass)
      if (match) {
        sessionStorage.setItem('royal_auth', 'true')
        onLogin()
      } else {
        setError(true)
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1C2A08 0%, #2A3A10 60%, #1C1C1B 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Roboto, sans-serif', padding: 24,
    }}>
      <div style={{
        background: '#FAFDF5', borderRadius: 20, padding: '40px 36px',
        width: '100%', maxWidth: 380,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Logo + título */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: '#1C1C1B', borderRadius: 16, width: 80, height: 80, marginBottom: 16 }}>
            <RoyalLogoLogin/>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.12em',
            color: '#1C1C1B', margin: '0 0 4px', textTransform: 'uppercase' }}>ROYAL</h1>
          <p style={{ fontSize: 11, color: '#8A8A89', letterSpacing: '0.14em',
            textTransform: 'uppercase', margin: 0 }}>Dashboard Marketing</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em',
              color: '#8A8A89', fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Usuario
            </label>
            <input
              type="text" value={user} onChange={e => setUser(e.target.value)}
              placeholder="usuario"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                border: `1.5px solid ${error ? '#E24B4A' : '#D8E8B8'}`,
                outline: 'none', background: '#F4F7EE', color: '#1C1C1B',
                boxSizing: 'border-box', transition: 'border 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#95C11F'}
              onBlur={e => e.target.style.borderColor = error ? '#E24B4A' : '#D8E8B8'}
            />
          </div>

          <div>
            <label style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em',
              color: '#8A8A89', fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Contraseña
            </label>
            <input
              type="password" value={pass} onChange={e => setPass(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                border: `1.5px solid ${error ? '#E24B4A' : '#D8E8B8'}`,
                outline: 'none', background: '#F4F7EE', color: '#1C1C1B',
                boxSizing: 'border-box', transition: 'border 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#95C11F'}
              onBlur={e => e.target.style.borderColor = error ? '#E24B4A' : '#D8E8B8'}
            />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: '#E24B4A', margin: 0, textAlign: 'center' }}>
              Usuario o contraseña incorrectos
            </p>
          )}

          <button type="submit" disabled={loading || !user || !pass}
            style={{
              background: loading ? '#B8DC5A' : '#95C11F',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '13px', fontSize: 14, fontWeight: 500,
              cursor: loading || !user || !pass ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s', marginTop: 4,
              opacity: !user || !pass ? 0.6 : 1,
            }}>
            {loading ? 'Verificando…' : 'Ingresar'}
          </button>
        </form>

        <p style={{ fontSize: 10, color: '#C4C4C3', textAlign: 'center', marginTop: 24, marginBottom: 0 }}>
          Resumen Mensual de métricas Marketing
        </p>
      </div>
    </div>
  )
}
