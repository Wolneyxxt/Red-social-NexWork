import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './Auth.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.user, data.token)
      navigate('/feed')
    } catch (err) {
      setError(err.response?.data?.msg || 'Erro ao entrar')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
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
        <h1>Sua rede profissional começa aqui.</h1>
        <p>Conecte-se com profissionais, compartilhe projetos e encontre oportunidades.</p>
        <div className="auth-stats">
          <div><strong>50k+</strong><span>Profissionais</span></div>
          <div><strong>12k+</strong><span>Vagas abertas</span></div>
          <div><strong>98%</strong><span>Satisfação</span></div>
        </div>
      </div>

      <div className="auth-right">
        <form className="auth-form" onSubmit={submit}>
          <h2>Entrar</h2>
          <p className="auth-sub">Bem-vindo de volta!</p>

          {error && <div className="auth-error">{error}</div>}

          <label>Email</label>
          <input name="email" type="email" placeholder="seu@email.com" value={form.email} onChange={handle} required />

          <label>Senha</label>
          <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} required />

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="auth-switch">
            Não tem conta? <Link to="/register">Cadastre-se</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
