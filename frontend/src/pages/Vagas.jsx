import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Vagas.css'

const TIPOS = ['CLT', 'PJ', 'Freela', 'Estágio']
const NIVEIS = ['Júnior', 'Pleno', 'Sênior', 'Tech Lead']

const EMPTY_FORM = {
  title: '', company: '', location: '', type: 'CLT',
  level: 'Pleno', salary: '', description: '', tags: ''
}

export default function Vagas() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tipos, setTipos] = useState([])
  const [niveis, setNiveis] = useState([])
  const [saved, setSaved] = useState([])
  const [applications, setApplications] = useState([])
  const [applyingId, setApplyingId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isRecruiter = user?.account_type === 'recruiter' || user?.role === 'Recrutador'

  const fetchJobs = () => {
    setLoading(true)
    api.get('/jobs')
      .then(r => setJobs(r.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false))
  }

  const fetchApplications = () => {
    api.get('/jobs/my-applications')
      .then(r => setApplications(r.data || []))
      .catch(() => {})
  }

  useEffect(() => {
    fetchJobs()
    fetchApplications()
  }, [])

  const toggleTipo = t => setTipos(v => v.includes(t) ? v.filter(x => x !== t) : [...v, t])
  const toggleNivel = n => setNiveis(v => v.includes(n) ? v.filter(x => x !== n) : [...v, n])
  const toggleSaved = id => setSaved(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id])

  const handleApply = async (jobId) => {
    const applied = applications.includes(jobId)
    setApplyingId(jobId)
    try {
      if (applied) {
        await api.delete(`/jobs/${jobId}/apply`)
        setApplications(v => v.filter(id => id !== jobId))
      } else {
        await api.post(`/jobs/${jobId}/apply`)
        setApplications(v => [...v, jobId])
      }
    } catch (e) {
      alert(e.response?.data?.msg || 'Erro ao candidatar-se.')
    } finally {
      setApplyingId(null)
    }
  }

  const filtered = jobs.filter(j => {
    const matchSearch = !search ||
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.company?.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(j.tags) ? j.tags : []).some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchTipo = tipos.length === 0 || tipos.includes(j.type)
    const matchNivel = niveis.length === 0 || niveis.includes(j.level)
    return matchSearch && matchTipo && matchNivel
  })

  const handleSubmit = async () => {
    if (!form.title || !form.company || !form.description) {
      setError('Preencha título, empresa e descrição.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      }
      await api.post('/jobs', payload)
      setShowModal(false)
      setForm(EMPTY_FORM)
      fetchJobs()
    } catch (e) {
      setError(e.response?.data?.msg || 'Erro ao publicar vaga.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="vagas-layout">
      {/* Filtros */}
      <aside className="vagas-sidebar card">
        <h3>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          Filtros
        </h3>

        <div className="filter-group">
          <label>Tipo de Contrato</label>
          {TIPOS.map(t => (
            <div key={t} className="filter-check">
              <input type="checkbox" id={t} checked={tipos.includes(t)} onChange={() => toggleTipo(t)} />
              <label htmlFor={t}>{t}</label>
            </div>
          ))}
        </div>

        <div className="filter-group">
          <label>Nível</label>
          {NIVEIS.map(n => (
            <div key={n} className="filter-check">
              <input type="checkbox" id={n} checked={niveis.includes(n)} onChange={() => toggleNivel(n)} />
              <label htmlFor={n}>{n}</label>
            </div>
          ))}
        </div>
      </aside>

      {/* Lista */}
      <main className="vagas-main">
        <div className="vagas-search card">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Buscar vagas por cargo, empresa ou tecnologia..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {isRecruiter && (
            <button className="btn-primary" style={{whiteSpace:'nowrap', fontSize:13, padding:'8px 16px'}} onClick={() => setShowModal(true)}>
              + Publicar Vaga
            </button>
          )}
        </div>

        <div className="vagas-count">
          {loading ? 'Carregando...' : `${filtered.length} vaga${filtered.length !== 1 ? 's' : ''} encontrada${filtered.length !== 1 ? 's' : ''}`}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="card" style={{padding:40, textAlign:'center', color:'var(--text-muted)'}}>
            <p style={{fontSize:15}}>Nenhuma vaga publicada ainda.</p>
            {isRecruiter && (
              <button className="btn-primary" style={{marginTop:16}} onClick={() => setShowModal(true)}>
                Publicar primeira vaga
              </button>
            )}
          </div>
        )}

        {filtered.map(job => {
          const applied = applications.includes(job.id)
          const isApplying = applyingId === job.id
          return (
            <div key={job.id} className="job-card card">
              <div className="job-header">
                <div className="job-logo" style={{background: stringToColor(job.company)}}>
                  {job.company?.slice(0,2).toUpperCase()}
                </div>
                <div className="job-info">
                  <h3>{job.title}</h3>
                  <p className="job-company">{job.company}</p>
                  <div className="job-meta">
                    {job.location && (
                      <span>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {job.location}
                      </span>
                    )}
                    {job.type && <span>{job.type}</span>}
                    {job.level && <span>{job.level}</span>}
                    {job.salary && (
                      <span>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                        {job.salary}
                      </span>
                    )}
                  </div>
                </div>
                <button className="save-btn" onClick={() => toggleSaved(job.id)}>
                  <svg width="18" height="18" fill={saved.includes(job.id) ? 'var(--brand)' : 'none'} stroke={saved.includes(job.id) ? 'var(--brand)' : 'currentColor'} strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                </button>
              </div>

              <p className="job-description">{job.description}</p>

              {Array.isArray(job.tags) && job.tags.length > 0 && (
                <div className="job-tags">
                  {job.tags.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              )}

              <div className="job-footer">
                <span className="job-candidates">
                  {new Date(job.created_at).toLocaleDateString('pt-BR')}
                </span>
                {!isRecruiter && (
                  <button
                    className={applied ? 'btn-outline' : 'btn-primary'}
                    style={{fontSize:13, padding:'8px 20px'}}
                    disabled={isApplying}
                    onClick={() => handleApply(job.id)}
                  >
                    {isApplying ? '...' : applied ? 'Candidatura enviada ✓' : 'Candidatar-se'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </main>

      {/* Modal publicar vaga */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Publicar Vaga</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Título da vaga *</label>
                  <input placeholder="Ex: Frontend Developer" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Empresa *</label>
                  <input placeholder="Nome da empresa" value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Localização</label>
                  <input placeholder="Ex: São Paulo, SP (Remoto)" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Salário</label>
                  <input placeholder="Ex: R$ 8.000 - R$ 12.000" value={form.salary} onChange={e => setForm(f => ({...f, salary: e.target.value}))} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de contrato</label>
                  <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>
                    {TIPOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Nível</label>
                  <select value={form.level} onChange={e => setForm(f => ({...f, level: e.target.value}))}>
                    {NIVEIS.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Descrição *</label>
                <textarea rows={4} placeholder="Descreva a vaga, responsabilidades e requisitos..." value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
              </div>

              <div className="form-group">
                <label>Tags / Tecnologias</label>
                <input placeholder="Ex: React, Node.js, AWS (separe por vírgula)" value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))} />
              </div>

              {error && <p className="form-error">{error}</p>}
            </div>

            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Publicando...' : 'Publicar Vaga'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function stringToColor(str = '') {
  const colors = ['#5B4FE8','#06B6D4','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899']
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}
