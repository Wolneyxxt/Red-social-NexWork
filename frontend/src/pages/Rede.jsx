import { useState, useEffect } from 'react'
import api from '../services/api'
import './Rede.css'

export default function Rede() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('sugestoes')
  const [connected, setConnected] = useState([])

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data)).catch(() => {})
  }, [])

  const connect = (id) => {
    if (connected.includes(id)) {
      setConnected(c => c.filter(x => x !== id))
    } else {
      setConnected(c => [...c, id])
    }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase()) ||
    u.company?.toLowerCase().includes(search.toLowerCase())
  )

  const sugestoes = filtered.filter(u => !connected.includes(u.id))
  const minhasConexoes = filtered.filter(u => connected.includes(u.id))

  return (
    <div className="rede-page">
      {/* Stats */}
      <div className="rede-stats">
        <div className="stat-card card">
          <div className="stat-icon" style={{background:'#EEF0FF'}}>
            <svg width="22" height="22" fill="none" stroke="#5B4FE8" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <strong>{connected.length}</strong>
            <span>Conexões</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{background:'#ECFDF5'}}>
            <svg width="22" height="22" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
            </svg>
          </div>
          <div>
            <strong>234</strong>
            <span>Visualizações do Perfil</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{background:'#FFF7ED'}}>
            <svg width="22" height="22" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <div>
            <strong>12</strong>
            <span>Convites Pendentes</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rede-search card">
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          placeholder="Buscar por nome, cargo, empresa ou habilidades..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="rede-tabs">
        <button
          className={tab === 'sugestoes' ? 'tab active' : 'tab'}
          onClick={() => setTab('sugestoes')}
        >
          Sugestões ({sugestoes.length})
        </button>
        <button
          className={tab === 'conexoes' ? 'tab active' : 'tab'}
          onClick={() => setTab('conexoes')}
        >
          Minhas Conexões ({minhasConexoes.length})
        </button>
      </div>

      {/* Cards */}
      <div className="rede-grid">
        {(tab === 'sugestoes' ? sugestoes : minhasConexoes).length === 0 ? (
          <div className="rede-empty card">
            <p>{tab === 'sugestoes' ? 'Nenhuma sugestão encontrada.' : 'Você ainda não tem conexões.'}</p>
          </div>
        ) : (
          (tab === 'sugestoes' ? sugestoes : minhasConexoes).map(user => (
            <div key={user.id} className="user-card card">
              <img
                className="user-avatar"
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt={user.name}
              />
              <div className="user-info">
                <h3>{user.name}</h3>
                <p className="user-role">{user.role || 'Profissional de Tecnologia'}</p>
                {user.company && (
                  <p className="user-company">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    {user.company}
                  </p>
                )}
                {user.tags?.length > 0 && (
                  <div className="user-tags">
                    {user.tags.slice(0,3).map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                )}
              </div>
              <button
                className={connected.includes(user.id) ? 'btn-outline conectado' : 'btn-primary'}
                onClick={() => connect(user.id)}
              >
                {connected.includes(user.id) ? 'Conectado ✓' : '+ Conectar'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
