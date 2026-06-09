import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useState } from 'react'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  let hideTimeout = null

  const handleMouseEnter = () => { clearTimeout(hideTimeout); setShowMenu(true) }
  const handleMouseLeave = () => { hideTimeout = setTimeout(() => setShowMenu(false), 120) }
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <div className="navbar-brand">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="5" cy="12" r="2.5" fill="white"/>
              <circle cx="19" cy="6" r="2.5" fill="white"/>
              <circle cx="19" cy="18" r="2.5" fill="white"/>
              <line x1="7.2" y1="11" x2="17" y2="7.2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="7.2" y1="13" x2="17" y2="16.8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="brand-name">NexWork</span>
        </div>

        {/* Search */}
        <div className="navbar-search">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input placeholder="Buscar profissionais, projetos, skills..." />
        </div>

        {/* Nav */}
        <nav className="navbar-nav">
          <NavLink to="/feed" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Feed
          </NavLink>
          <NavLink to="/rede" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Rede
          </NavLink>
          <NavLink to="/vagas" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            Vagas
          </NavLink>
          <NavLink to="/mensagens" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Mensagens
          </NavLink>
        </nav>

        {/* Actions */}
        <div className="navbar-actions">

          {/* Toggle dark/light */}
          <button className="theme-toggle" onClick={toggle} title={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}>
            {dark ? (
              /* Sol — modo claro */
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              /* Lua — modo escuro */
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Notificações */}
          <button className="notif-btn" title="Notificações">
            <span className="notif-dot"/>
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>

          {/* Avatar + menu */}
          <div className="navbar-avatar-wrap" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <img
              className="navbar-avatar-img"
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt="avatar"
            />
            {showMenu && (
              <div className="avatar-menu">
                <div className="avatar-menu-user">
                  <strong>{user?.name}</strong>
                  <span>{user?.role || 'Profissional'}</span>
                </div>
                <div className="avatar-menu-divider"/>
                <button onClick={() => { navigate('/perfil'); setShowMenu(false) }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  Meu Perfil
                </button>
                <button onClick={() => { toggle(); setShowMenu(false) }}>
                  {dark
                    ? <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                    : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                  }
                  {dark ? 'Modo claro' : 'Modo escuro'}
                </button>
                <div className="avatar-menu-divider"/>
                <button onClick={handleLogout} className="logout-btn">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  )
}
