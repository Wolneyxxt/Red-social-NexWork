import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Mensagens.css'

const MOCK_CONVERSATIONS = [
  {
    id: '1',
    user: { name: 'Ana Silva', role: 'Full Stack Developer', seed: 'ana', online: true },
    lastMessage: 'Ótimo! Vou revisar o código hoje.',
    time: '10:45',
    unread: 2,
    messages: [
      { from: 'them', text: 'Oi! Vi seu portfólio e fiquei impressionada com seus projetos.', time: '10:30' },
      { from: 'me', text: 'Obrigado! Fico feliz que tenha gostado.', time: '10:32' },
      { from: 'them', text: 'Você poderia me ajudar com uma dúvida sobre React?', time: '10:33' },
      { from: 'me', text: 'Claro! Pode perguntar.', time: '10:35' },
      { from: 'them', text: 'Estou tendo problemas com gerenciamento de estado. Você usa Context API ou Redux?', time: '10:36' },
      { from: 'me', text: 'Depende do projeto. Para aplicações menores, uso Context API. Para apps mais complexos, prefiro Redux Toolkit ou Zustand.', time: '10:38' },
      { from: 'them', text: 'Entendi! Vou dar uma olhada no Zustand. Parece mais simples que Redux.', time: '10:40' },
      { from: 'me', text: 'Com certeza! É bem mais leve e tem uma API muito intuitiva. Se precisar de ajuda, é só chamar.', time: '10:42' },
      { from: 'them', text: 'Ótimo! Vou revisar o código hoje.', time: '10:45' },
    ]
  },
  {
    id: '2',
    user: { name: 'Carlos Mendes', role: 'Data Scientist', seed: 'carlos', online: false },
    lastMessage: 'Podemos agendar uma reunião?',
    time: 'Ontem',
    unread: 0,
    messages: [
      { from: 'them', text: 'Olá! Vi que você trabalha com Node.js.', time: '09:00' },
      { from: 'me', text: 'Sim! Há alguns anos.', time: '09:05' },
      { from: 'them', text: 'Podemos agendar uma reunião?', time: '09:10' },
    ]
  },
  {
    id: '3',
    user: { name: 'Mariana Costa', role: 'UX Designer', seed: 'mariana', online: true },
    lastMessage: 'Obrigada pela indicação!',
    time: '2 dias',
    unread: 1,
    messages: [
      { from: 'them', text: 'Oi! Obrigada pela indicação!', time: '14:00' },
      { from: 'me', text: 'De nada! Seu trabalho é incrível.', time: '14:10' },
    ]
  },
  {
    id: '4',
    user: { name: 'Pedro Santos', role: 'DevOps Engineer', seed: 'pedro', online: false },
    lastMessage: 'Vi seu projeto no GitHub, ficou top!',
    time: '3 dias',
    unread: 0,
    messages: [
      { from: 'them', text: 'Vi seu projeto no GitHub, ficou top!', time: '16:00' },
    ]
  },
]

export default function Mensagens() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS)
  const [active, setActive] = useState(MOCK_CONVERSATIONS[0])
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')

  const send = () => {
    if (!text.trim()) return
    const newMsg = { from: 'me', text, time: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}) }
    setConversations(prev => prev.map(c =>
      c.id === active.id
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, time: 'agora', unread: 0 }
        : c
    ))
    setActive(prev => ({ ...prev, messages: [...prev.messages, newMsg] }))
    setText('')
  }

  const selectConv = (conv) => {
    setActive(conv)
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c))
  }

  const filtered = conversations.filter(c =>
    c.user.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="msg-layout">
      {/* Lista conversas */}
      <aside className="msg-sidebar card">
        <div className="msg-sidebar-header">
          <h3>Mensagens</h3>
          <button className="icon-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>

        <div className="msg-search">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input placeholder="Buscar conversas..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="conv-list">
          {filtered.map(conv => (
            <div
              key={conv.id}
              className={`conv-item ${active.id === conv.id ? 'active' : ''}`}
              onClick={() => selectConv(conv)}
            >
              <div className="conv-avatar-wrap">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.user.seed}`} alt={conv.user.name} />
                {conv.user.online && <span className="online-dot" />}
              </div>
              <div className="conv-info">
                <div className="conv-top">
                  <strong>{conv.user.name}</strong>
                  <span className="conv-time">{conv.time}</span>
                </div>
                <div className="conv-bottom">
                  <span className="conv-last">{conv.lastMessage}</span>
                  {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat */}
      <div className="msg-chat card">
        {/* Header */}
        <div className="chat-header">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${active.user.seed}`} alt={active.user.name} />
          <div>
            <strong>{active.user.name}</strong>
            <span className={active.user.online ? 'online' : 'offline'}>
              {active.user.online ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="chat-actions">
            <button className="icon-btn">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16a2 2 0 0 1 .27.92z"/>
              </svg>
            </button>
            <button className="icon-btn">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </button>
            <button className="icon-btn">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {active.messages.map((msg, i) => (
            <div key={i} className={`msg-bubble-wrap ${msg.from === 'me' ? 'me' : 'them'}`}>
              {msg.from === 'them' && (
                <img className="msg-avatar" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${active.user.seed}`} alt="" />
              )}
              <div className="msg-bubble">
                <p>{msg.text}</p>
                <span className="msg-time">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="chat-input">
          <button className="icon-btn">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>
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
    </div>
  )
}
