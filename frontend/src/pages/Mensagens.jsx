import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './Mensagens.css'

export default function Mensagens() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [showNewChat, setShowNewChat] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)
  const pollRef = useRef(null)

  const fetchConversations = async () => {
    try {
      const r = await api.get('/messages')
      setConversations(r.data || [])
    } catch {}
  }

  const fetchMessages = async (convId) => {
    try {
      const r = await api.get(`/messages/${convId}/messages`)
      setMessages(r.data || [])
    } catch {}
  }

  useEffect(() => {
    fetchConversations().finally(() => setLoading(false))
    api.get('/users').then(r => setUsers(r.data || [])).catch(() => {})
  }, [])

  // Polling de mensagens a cada 3s quando há conversa ativa
  useEffect(() => {
    if (!active) return
    fetchMessages(active.id)
    pollRef.current = setInterval(() => fetchMessages(active.id), 3000)
    return () => clearInterval(pollRef.current)
  }, [active?.id])

  // Scroll para o fim
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectConv = (conv) => {
    setActive(conv)
    setShowNewChat(false)
  }

  const startConvWith = async (targetUser) => {
    try {
      const r = await api.post(`/messages/with/${targetUser.id}`)
      await fetchConversations()
      // Monta conversa local para ativar
      setActive({ id: r.data.id, other: targetUser })
      setShowNewChat(false)
      setUserSearch('')
    } catch {}
  }

  const send = async () => {
    if (!text.trim() || !active) return
    const txt = text.trim()
    setText('')
    try {
      const r = await api.post(`/messages/${active.id}/messages`, { text: txt })
      setMessages(prev => [...prev, r.data])
      fetchConversations()
    } catch {}
  }

  const filtered = conversations.filter(c =>
    c.other?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) &&
    u.id !== user?.id
  )

  const formatTime = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatConvTime = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    const now = new Date()
    const diff = now - d
    if (diff < 86400000) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    if (diff < 172800000) return 'Ontem'
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  return (
    <div className="msg-layout">
      {/* Sidebar */}
      <aside className="msg-sidebar card">
        <div className="msg-sidebar-header">
          <h3>Mensagens</h3>
          <button className="icon-btn" title="Nova conversa" onClick={() => setShowNewChat(v => !v)}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>

        {/* Nova conversa */}
        {showNewChat && (
          <div className="new-chat-panel">
            <input
              autoFocus
              placeholder="Buscar usuário..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
            />
            <div className="new-chat-list">
              {filteredUsers.length === 0 && <p className="no-users">Nenhum usuário encontrado</p>}
              {filteredUsers.map(u => (
                <div key={u.id} className="new-chat-item" onClick={() => startConvWith(u)}>
                  <div className="conv-avatar-wrap">
                    {u.avatar
                      ? <img src={u.avatar} alt={u.name} />
                      : <div className="avatar-initials">{u.name?.slice(0,2).toUpperCase()}</div>
                    }
                  </div>
                  <div>
                    <strong>{u.name}</strong>
                    <span>{u.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="msg-search">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input placeholder="Buscar conversas..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="conv-list">
          {loading && <p style={{padding:'20px', textAlign:'center', color:'var(--text-muted)', fontSize:13}}>Carregando...</p>}
          {!loading && filtered.length === 0 && (
            <p style={{padding:'20px', textAlign:'center', color:'var(--text-muted)', fontSize:13}}>
              Nenhuma conversa ainda.<br/>Clique no ícone acima para iniciar.
            </p>
          )}
          {filtered.map(conv => (
            <div
              key={conv.id}
              className={`conv-item ${active?.id === conv.id ? 'active' : ''}`}
              onClick={() => selectConv(conv)}
            >
              <div className="conv-avatar-wrap">
                {conv.other?.avatar
                  ? <img src={conv.other.avatar} alt={conv.other.name} />
                  : <div className="avatar-initials">{conv.other?.name?.slice(0,2).toUpperCase()}</div>
                }
              </div>
              <div className="conv-info">
                <div className="conv-top">
                  <strong>{conv.other?.name}</strong>
                  <span className="conv-time">{formatConvTime(conv.lastMessage?.created_at)}</span>
                </div>
                <div className="conv-bottom">
                  <span className="conv-last">{conv.lastMessage?.text || 'Sem mensagens'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat */}
      {active ? (
        <div className="msg-chat card">
          <div className="chat-header">
            {active.other?.avatar
              ? <img src={active.other.avatar} alt={active.other.name} />
              : <div className="avatar-initials" style={{width:40,height:40,fontSize:14}}>{active.other?.name?.slice(0,2).toUpperCase()}</div>
            }
            <div>
              <strong>{active.other?.name}</strong>
              <span style={{fontSize:12, color:'var(--text-muted)'}}>{active.other?.role}</span>
            </div>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <p style={{textAlign:'center', color:'var(--text-muted)', fontSize:13, margin:'auto'}}>
                Nenhuma mensagem ainda. Diga olá! 👋
              </p>
            )}
            {messages.map(msg => {
              const isMe = msg.sender_id === user?.id
              return (
                <div key={msg.id} className={`msg-bubble-wrap ${isMe ? 'me' : 'them'}`}>
                  {!isMe && (
                    active.other?.avatar
                      ? <img className="msg-avatar" src={active.other.avatar} alt="" />
                      : <div className="msg-avatar avatar-initials" style={{fontSize:10}}>{active.other?.name?.slice(0,2).toUpperCase()}</div>
                  )}
                  <div className="msg-bubble">
                    <p>{msg.text}</p>
                    <span className="msg-time">{formatTime(msg.created_at)}</span>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input">
            <input
              placeholder="Escreva uma mensagem..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button className="btn-primary send-btn" onClick={send}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="msg-chat card" style={{display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12, color:'var(--text-muted)'}}>
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{opacity:0.3}}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <p style={{fontSize:14}}>Selecione uma conversa ou inicie uma nova</p>
        </div>
      )}
    </div>
  )
}
