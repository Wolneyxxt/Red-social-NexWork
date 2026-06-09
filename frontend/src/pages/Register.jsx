import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './Auth.css'

export default function Register() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    account_type: '',
    recruiter_company: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const selectType = (type) => {
    setForm(f => ({ ...f, account_type: type }))
    setStep(2)
  }

  const submit = async e => {
    e.preventDefault()
    if (!form.account_type) return setError('Selecione o tipo de conta.')
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/register', form)
      login(data.user, data.token)
      navigate('/feed')
    } catch (err) {
      setError(err.response?.data?.msg || 'Erro ao cadastrar')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="brand-logo">N</div>
          <span className="brand-name">NexWork</span>
        </div>
        <h1>Junte-se à maior rede de tech do Brasil.</h1>
        <p>Mostre seus projetos, encontre conexões e acelere sua carreira.</p>
        <div className="auth-stats">
          <div><strong>50k+</strong><span>Profissionais</span></div>
          <div><strong>12k+</strong><span>Vagas abertas</span></div>
          <div><strong>98%</strong><span>Satisfação</span></div>
        </div>
      </div>

      <div className="auth-right">
        {step === 1 ? (
          <div className="auth-type-select">
            <h2>Criar conta</h2>
            <p className="auth-sub">Como você quer usar o NexWork?</p>

            <button className="type-card" onClick={() => selectType('user')}>
              <div className="type-icon user-icon">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="type-info">
                <strong>Profissional</strong>
                <span>Compartilhe projetos, conecte-se com pessoas e encontre oportunidades</span>
              </div>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            <button className="type-card" onClick={() => selectType('recruiter')}>
              <div className="type-icon recruiter-icon">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <div className="type-info">
                <strong>Recrutador</strong>
                <span>Publique vagas, encontre talentos e conecte-se com profissionais</span>
              </div>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            <p className="auth-switch">
              Já tem conta? <Link to="/login">Entrar</Link>
            </p>
          </div>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            <button type="button" className="back-btn" onClick={() => setStep(1)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Voltar
            </button>

            <h2>
              {form.account_type === 'recruiter' ? '🏢 Conta Recrutador' : '👤 Conta Profissional'}
            </h2>
            <p className="auth-sub">Rápido e gratuito.</p>

            {error && <div className="auth-error">{error}</div>}

            <label>Nome completo</label>
            <input name="name" placeholder="João Silva" value={form.name} onChange={handle} required />

            {form.account_type === 'recruiter' && (
              <>
                <label>Empresa / Instituição</label>
                <input name="recruiter_company" placeholder="Ex: Tech Solutions Inc." value={form.recruiter_company} onChange={handle} required />
              </>
            )}

            <label>Email</label>
            <input name="email" type="email" placeholder="seu@email.com" value={form.email} onChange={handle} required />

            <label>Senha</label>
            <input name="password" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={handle} required minLength={6} />

            <button type="submit" className="btn-primary auth-btn" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>

            <p className="auth-switch">
              Já tem conta? <Link to="/login">Entrar</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
