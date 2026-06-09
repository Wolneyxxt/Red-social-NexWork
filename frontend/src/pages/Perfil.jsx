import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import ConfirmModal from '../components/ConfirmModal'
import './Perfil.css'

const LEVELS = ['Nativo', 'Fluente', 'Avançado', 'Intermediário', 'Básico']

/* ---------- Sub-componentes ---------- */

function Section({ title, icon, children, onAdd }) {
  return (
    <div className="perfil-section card">
      <div className="section-header">
        <h3>{icon} {title}</h3>
        {onAdd && (
          <button className="section-add-btn" onClick={onAdd}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Adicionar
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="form-modal" onClick={e => e.stopPropagation()}>
        <div className="form-modal-header">
          <h3>{title}</h3>
          <button onClick={onClose}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* Engrenagem com dropdown de configurações */
function GearMenu({ onEditProfile, onChangePassword, onChangeEmail }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="gear-wrap" ref={ref}>
      <button
        className="gear-btn"
        onClick={() => setOpen(v => !v)}
        title="Configurações"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        Configurações
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{marginLeft:2}}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="gear-dropdown">
          <button onClick={() => { onEditProfile(); setOpen(false) }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Informações pessoais
          </button>
          <button onClick={() => { onChangeEmail(); setOpen(false) }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
            Alterar e-mail
          </button>
          <div className="gear-divider"/>
          <button onClick={() => { onChangePassword(); setOpen(false) }} className="gear-danger">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Alterar senha
          </button>
        </div>
      )}
    </div>
  )
}

/* ---------- Página principal ---------- */

export default function Perfil() {
  const { user, login, token, refreshUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('projetos')
  const [editingProfile, setEditingProfile] = useState(false)
  const [success, setSuccess] = useState('')
  const [formError, setFormError] = useState('')

  // Data
  const [education, setEducation] = useState([])
  const [languages, setLanguages] = useState([])
  const [skills, setSkills] = useState([])
  const [projects, setProjects] = useState([])
  const [certificates, setCertificates] = useState([])

  // Modals
  const [modal, setModal] = useState('')
  const [confirm, setConfirm] = useState({ open: false, fn: null, loading: false })

  // Forms
  const [profileForm, setProfileForm] = useState({ name:'', role:'', company:'', bio:'', avatar:'', banner:'', location:'', website:'' })
  const [eduForm, setEduForm] = useState({ degree:'', institution:'', year_start:'', year_end:'', status:'Concluído' })
  const [langForm, setLangForm] = useState({ name:'', level:'Intermediário' })
  const [skillForm, setSkillForm] = useState({ name:'' })
  const [projForm, setProjForm] = useState({ title:'', category:'', date:'', description:'', image:'', github:'', tags:'' })
  const [certForm, setCertForm] = useState({ title:'', issuer:'', date:'', credential_url:'', image:'' })
  const [passForm, setPassForm] = useState({ newPassword:'', confirmPassword:'' })
  const [emailForm, setEmailForm] = useState({ newEmail:'' })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [p, edu, lang, sk, proj, cert] = await Promise.all([
        api.get('/users/me'),
        api.get('/users/me/education'),
        api.get('/users/me/languages'),
        api.get('/users/me/skills'),
        api.get('/users/me/projects'),
        api.get('/users/me/certificates'),
      ])
      setProfile(p.data)
      setProfileForm({
        name: p.data.name||'', role: p.data.role||'', company: p.data.company||'',
        bio: p.data.bio||'', avatar: p.data.avatar||'', banner: p.data.banner||'',
        location: p.data.location||'', website: p.data.website||''
      })
      setEducation(edu.data)
      setLanguages(lang.data)
      setSkills(sk.data)
      setProjects(proj.data)
      setCertificates(cert.data)
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
    } finally { setLoading(false) }
  }

  const showSuccess = msg => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }

  const openModal = (name) => { setFormError(''); setModal(name) }
  const closeModal = () => { setFormError(''); setModal('') }

  /* ---- Perfil ---- */
  const saveProfile = async e => {
    e.preventDefault(); setSaving(true); setFormError('')
    try {
      const { data } = await api.put('/users/me', profileForm)
      setProfile(data)
      login({ ...user, ...data }, token)
      await refreshUser()
      setEditingProfile(false)
      showSuccess('Perfil atualizado!')
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Erro ao salvar perfil.')
    } finally { setSaving(false) }
  }

  /* ---- Senha ---- */
  const savePassword = async e => {
    e.preventDefault(); setFormError('')
    if (passForm.newPassword !== passForm.confirmPassword) {
      return setFormError('As senhas não coincidem.')
    }
    if (passForm.newPassword.length < 6) {
      return setFormError('Mínimo de 6 caracteres.')
    }
    setSaving(true)
    try {
      await api.put('/users/me/password', { newPassword: passForm.newPassword })
      closeModal()
      setPassForm({ newPassword:'', confirmPassword:'' })
      showSuccess('Senha alterada com sucesso!')
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Erro ao alterar senha.')
    } finally { setSaving(false) }
  }

  /* ---- Email ---- */
  const saveEmail = async e => {
    e.preventDefault(); setFormError('')
    if (!emailForm.newEmail.includes('@')) return setFormError('E-mail inválido.')
    setSaving(true)
    try {
      // Rota genérica de update de perfil — ou você pode criar uma rota específica no backend
      await api.put('/users/me', { email: emailForm.newEmail })
      closeModal()
      setEmailForm({ newEmail:'' })
      showSuccess('E-mail atualizado! Verifique sua caixa de entrada.')
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Erro ao alterar e-mail.')
    } finally { setSaving(false) }
  }

  /* ---- Formação ---- */
  const addEdu = async e => {
    e.preventDefault(); setSaving(true); setFormError('')
    try {
      const { data } = await api.post('/users/me/education', eduForm)
      setEducation(p => [...p, data])
      closeModal()
      setEduForm({ degree:'', institution:'', year_start:'', year_end:'', status:'Concluído' })
      showSuccess('Formação adicionada!')
    } catch (err) {
      console.error('Erro addEdu:', err.response?.data || err.message)
      setFormError(err.response?.data?.msg || 'Erro ao adicionar formação. Verifique a conexão com o servidor.')
    } finally { setSaving(false) }
  }

  /* ---- Idioma ---- */
  const addLang = async e => {
    e.preventDefault(); setSaving(true); setFormError('')
    try {
      const { data } = await api.post('/users/me/languages', langForm)
      setLanguages(p => [...p, data])
      closeModal()
      setLangForm({ name:'', level:'Intermediário' })
      showSuccess('Idioma adicionado!')
    } catch (err) {
      console.error('Erro addLang:', err.response?.data || err.message)
      setFormError(err.response?.data?.msg || 'Erro ao adicionar idioma. Verifique a conexão com o servidor.')
    } finally { setSaving(false) }
  }

  /* ---- Habilidade ---- */
  const addSkill = async e => {
    e.preventDefault(); setSaving(true); setFormError('')
    try {
      const { data } = await api.post('/users/me/skills', skillForm)
      setSkills(p => [...p, data])
      closeModal()
      setSkillForm({ name:'' })
      showSuccess('Habilidade adicionada!')
    } catch (err) {
      console.error('Erro addSkill:', err.response?.data || err.message)
      setFormError(err.response?.data?.msg || 'Erro ao adicionar habilidade. Verifique a conexão com o servidor.')
    } finally { setSaving(false) }
  }

  /* ---- Projeto ---- */
  const addProj = async e => {
    e.preventDefault(); setSaving(true); setFormError('')
    try {
      const payload = { ...projForm, tags: projForm.tags.split(',').map(t => t.trim()).filter(Boolean) }
      const { data } = await api.post('/users/me/projects', payload)
      setProjects(p => [data, ...p])
      closeModal()
      setProjForm({ title:'', category:'', date:'', description:'', image:'', github:'', tags:'' })
      showSuccess('Projeto adicionado!')
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Erro ao adicionar projeto.')
    } finally { setSaving(false) }
  }

  /* ---- Certificado ---- */
  const addCert = async e => {
    e.preventDefault(); setSaving(true); setFormError('')
    try {
      const { data } = await api.post('/users/me/certificates', certForm)
      setCertificates(p => [data, ...p])
      closeModal()
      setCertForm({ title:'', issuer:'', date:'', credential_url:'', image:'' })
      showSuccess('Certificado adicionado!')
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Erro ao adicionar certificado.')
    } finally { setSaving(false) }
  }

  /* ---- Delete genérico ---- */
  const deleteItem = (fn) => setConfirm({ open: true, fn, loading: false })
  const runDelete = async () => {
    setConfirm(c => ({ ...c, loading: true }))
    try { await confirm.fn(); setConfirm({ open:false, fn:null, loading:false }) }
    catch { setConfirm(c => ({ ...c, loading:false })) }
  }

  if (loading) return (
    <div className="perfil-loading">
      <span className="feed-spinner" />
      <p>Carregando perfil...</p>
    </div>
  )

  const pf = profile

  return (
    <div className="perfil-page">
      <ConfirmModal
        open={confirm.open} danger
        title="Confirmar exclusão"
        message="Essa ação não pode ser desfeita."
        loading={confirm.loading}
        onConfirm={runDelete}
        onCancel={() => setConfirm({ open:false, fn:null, loading:false })}
      />

      {/* HERO */}
      <div className="perfil-hero-card card">
        <div className="perfil-banner" style={pf?.banner ? { backgroundImage:`url(${pf.banner})`, backgroundSize:'cover', backgroundPosition:'center' } : {}}>
        </div>

        <div className="perfil-hero-body">
          <div className="perfil-avatar-wrap">
            <img
              src={pf?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pf?.name}`}
              alt={pf?.name}
              className="perfil-big-avatar"
            />
          </div>

          <div className="perfil-hero-info">
            <div className="perfil-name-row">
              <h1>{pf?.name}</h1>
              {pf?.role && <span className="verified-badge">✓</span>}
            </div>
            {pf?.role && <p className="perfil-role">{pf.role}</p>}
            <div className="perfil-meta-row">
              {pf?.company && <span>🏢 {pf.company}</span>}
              {pf?.location && <span>📍 {pf.location}</span>}
              {pf?.website && <a href={pf.website} target="_blank" rel="noreferrer">🔗 {pf.website}</a>}
            </div>
          </div>

          <div className="perfil-hero-actions">
            <GearMenu
              onEditProfile={() => { setFormError(''); setEditingProfile(true) }}
              onChangePassword={() => openModal('senha')}
              onChangeEmail={() => openModal('email')}
            />
          </div>
        </div>
      </div>

      {success && <div className="perfil-success">✓ {success}</div>}

      <div className="perfil-body">
        {/* SIDEBAR */}
        <aside className="perfil-sidebar">
          {pf?.bio && (
            <Section title="Sobre" icon="💼">
              <p className="section-bio">{pf.bio}</p>
            </Section>
          )}

          <Section title="Formação" icon="🎓" onAdd={() => openModal('edu')}>
            {education.length === 0
              ? <p className="section-empty">Nenhuma formação adicionada.</p>
              : education.map(e => (
                <div key={e.id} className="edu-item">
                  <div className="edu-info">
                    <strong>{e.degree}</strong>
                    <span>{e.institution}</span>
                    <span className="edu-year">{e.year_start}{e.year_end ? ` - ${e.year_end}` : ''} · {e.status}</span>
                  </div>
                  <button className="item-delete" title="Remover" onClick={() => deleteItem(async () => {
                    await api.delete(`/users/me/education/${e.id}`)
                    setEducation(p => p.filter(x => x.id !== e.id))
                  })}>✕</button>
                </div>
              ))
            }
          </Section>

          <Section title="Idiomas" icon="🌐" onAdd={() => openModal('lang')}>
            {languages.length === 0
              ? <p className="section-empty">Nenhum idioma adicionado.</p>
              : languages.map(l => (
                <div key={l.id} className="lang-item">
                  <span className="lang-name">{l.name}</span>
                  <div className="lang-right">
                    <span className="lang-level">{l.level}</span>
                    <button className="item-delete" title="Remover" onClick={() => deleteItem(async () => {
                      await api.delete(`/users/me/languages/${l.id}`)
                      setLanguages(p => p.filter(x => x.id !== l.id))
                    })}>✕</button>
                  </div>
                </div>
              ))
            }
          </Section>

          <Section title="</> Habilidades Técnicas" icon="" onAdd={() => openModal('skill')}>
            {skills.length === 0
              ? <p className="section-empty">Nenhuma habilidade adicionada.</p>
              : (
                <div className="skills-grid">
                  {skills.map(s => (
                    <div key={s.id} className="skill-tag-item">
                      <span>{s.name}</span>
                      <button title="Remover" onClick={() => deleteItem(async () => {
                        await api.delete(`/users/me/skills/${s.id}`)
                        setSkills(p => p.filter(x => x.id !== s.id))
                      })}>✕</button>
                    </div>
                  ))}
                </div>
              )
            }
          </Section>
        </aside>

        {/* MAIN */}
        <main className="perfil-main">
          <div className="perfil-tabs-wrap card">
            <div className="perfil-tabs">
              {['projetos','certificados'].map(t => (
                <button key={t} className={activeTab===t ? 'tab active' : 'tab'} onClick={() => setActiveTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'projetos' && (
            <div className="projects-section">
              <div className="projects-header">
                <h3>Portfólio de Projetos</h3>
                <button className="btn-primary" onClick={() => openModal('proj')}>+ Novo Projeto</button>
              </div>
              {projects.length === 0 ? (
                <div className="empty-state card">
                  <p>Nenhum projeto adicionado ainda.</p>
                  <button className="btn-primary" onClick={() => openModal('proj')}>Adicionar projeto</button>
                </div>
              ) : projects.map(p => (
                <div key={p.id} className="project-card card">
                  {p.image && <div className="project-image"><img src={p.image} alt={p.title} /></div>}
                  <div className="project-body">
                    <div className="project-top">
                      <div>
                        <h4>{p.title}</h4>
                        <p className="project-meta">{p.category}{p.date ? ` · ${p.date}` : ''}</p>
                      </div>
                      <div className="project-actions">
                        {p.github && (
                          <a href={p.github} target="_blank" rel="noreferrer" className="icon-btn" title="GitHub">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                          </a>
                        )}
                        <button className="item-delete" onClick={() => deleteItem(async () => {
                          await api.delete(`/users/me/projects/${p.id}`)
                          setProjects(prev => prev.filter(x => x.id !== p.id))
                        })}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="project-desc">{p.description}</p>
                    {p.tags?.length > 0 && (
                      <div className="project-tags">
                        {p.tags.map(t => <span key={t} className="tag">{t}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'certificados' && (
            <div className="projects-section">
              <div className="projects-header">
                <h3>Certificados</h3>
                <button className="btn-primary" onClick={() => openModal('cert')}>+ Novo Certificado</button>
              </div>
              {certificates.length === 0 ? (
                <div className="empty-state card">
                  <p>Nenhum certificado adicionado ainda.</p>
                  <button className="btn-primary" onClick={() => openModal('cert')}>Adicionar certificado</button>
                </div>
              ) : (
                <div className="certs-grid">
                  {certificates.map(c => (
                    <div key={c.id} className="cert-card card">
                      {c.image && <img src={c.image} alt={c.title} className="cert-image" />}
                      <div className="cert-body">
                        <h4>{c.title}</h4>
                        <p>{c.issuer}</p>
                        {c.date && <span className="cert-date">{c.date}</span>}
                        <div className="cert-actions">
                          {c.credential_url && <a href={c.credential_url} target="_blank" rel="noreferrer" className="btn-outline" style={{fontSize:12,padding:'4px 12px'}}>Ver credencial</a>}
                          <button className="item-delete" onClick={() => deleteItem(async () => {
                            await api.delete(`/users/me/certificates/${c.id}`)
                            setCertificates(prev => prev.filter(x => x.id !== c.id))
                          })}>✕</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ===== MODAIS ===== */}

      {/* EDITAR PERFIL */}
      <Modal open={editingProfile} title="Editar Perfil" onClose={() => setEditingProfile(false)}>
        <form onSubmit={saveProfile} className="modal-form">
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-row">
            <div className="form-group"><label>Nome *</label><input required value={profileForm.name} onChange={e=>setProfileForm(f=>({...f,name:e.target.value}))} placeholder="Seu nome" /></div>
            <div className="form-group"><label>Cargo</label><input value={profileForm.role} onChange={e=>setProfileForm(f=>({...f,role:e.target.value}))} placeholder="Ex: Senior Developer" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Empresa</label><input value={profileForm.company} onChange={e=>setProfileForm(f=>({...f,company:e.target.value}))} placeholder="Onde você trabalha" /></div>
            <div className="form-group"><label>Localização</label><input value={profileForm.location} onChange={e=>setProfileForm(f=>({...f,location:e.target.value}))} placeholder="Ex: São Paulo, Brasil" /></div>
          </div>
          <div className="form-group"><label>Site / Portfolio</label><input value={profileForm.website} onChange={e=>setProfileForm(f=>({...f,website:e.target.value}))} placeholder="https://seusite.com" /></div>
          <div className="form-group"><label>Foto de perfil (URL)</label><input value={profileForm.avatar} onChange={e=>setProfileForm(f=>({...f,avatar:e.target.value}))} placeholder="https://..." /></div>
          <div className="form-group"><label>Banner (URL)</label><input value={profileForm.banner} onChange={e=>setProfileForm(f=>({...f,banner:e.target.value}))} placeholder="https://..." /></div>
          <div className="form-group"><label>Bio</label><textarea rows={3} value={profileForm.bio} onChange={e=>setProfileForm(f=>({...f,bio:e.target.value}))} placeholder="Fale sobre você..." /></div>
          <button type="submit" className="btn-primary modal-submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</button>
        </form>
      </Modal>

      {/* ALTERAR SENHA */}
      <Modal open={modal==='senha'} title="🔒 Alterar Senha" onClose={closeModal}>
        <form onSubmit={savePassword} className="modal-form">
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-group"><label>Nova senha</label><input type="password" required minLength={6} value={passForm.newPassword} onChange={e=>setPassForm(f=>({...f,newPassword:e.target.value}))} placeholder="Mínimo 6 caracteres" /></div>
          <div className="form-group"><label>Confirmar nova senha</label><input type="password" required value={passForm.confirmPassword} onChange={e=>setPassForm(f=>({...f,confirmPassword:e.target.value}))} placeholder="Repita a senha" /></div>
          <button type="submit" className="btn-primary modal-submit" disabled={saving}>{saving ? 'Salvando...' : 'Alterar senha'}</button>
        </form>
      </Modal>

      {/* ALTERAR EMAIL */}
      <Modal open={modal==='email'} title="✉️ Alterar E-mail" onClose={closeModal}>
        <form onSubmit={saveEmail} className="modal-form">
          {formError && <div className="form-error">{formError}</div>}
          <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:4}}>E-mail atual: <strong>{user?.email}</strong></p>
          <div className="form-group"><label>Novo e-mail</label><input type="email" required value={emailForm.newEmail} onChange={e=>setEmailForm(f=>({...f,newEmail:e.target.value}))} placeholder="novo@email.com" /></div>
          <button type="submit" className="btn-primary modal-submit" disabled={saving}>{saving ? 'Salvando...' : 'Alterar e-mail'}</button>
        </form>
      </Modal>

      {/* FORMAÇÃO */}
      <Modal open={modal==='edu'} title="🎓 Adicionar Formação" onClose={closeModal}>
        <form onSubmit={addEdu} className="modal-form">
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-group"><label>Curso/Grau *</label><input required value={eduForm.degree} onChange={e=>setEduForm(f=>({...f,degree:e.target.value}))} placeholder="Ex: Bacharelado em Ciência da Computação" /></div>
          <div className="form-group"><label>Instituição *</label><input required value={eduForm.institution} onChange={e=>setEduForm(f=>({...f,institution:e.target.value}))} placeholder="Ex: USP" /></div>
          <div className="form-row">
            <div className="form-group"><label>Ano início</label><input value={eduForm.year_start} onChange={e=>setEduForm(f=>({...f,year_start:e.target.value}))} placeholder="2020" /></div>
            <div className="form-group"><label>Ano fim</label><input value={eduForm.year_end} onChange={e=>setEduForm(f=>({...f,year_end:e.target.value}))} placeholder="2024" /></div>
          </div>
          <div className="form-group"><label>Status</label>
            <select value={eduForm.status} onChange={e=>setEduForm(f=>({...f,status:e.target.value}))}>
              <option>Concluído</option><option>Em andamento</option><option>Trancado</option>
            </select>
          </div>
          <button type="submit" className="btn-primary modal-submit" disabled={saving}>{saving ? 'Adicionando...' : 'Adicionar'}</button>
        </form>
      </Modal>

      {/* IDIOMA */}
      <Modal open={modal==='lang'} title="🌐 Adicionar Idioma" onClose={closeModal}>
        <form onSubmit={addLang} className="modal-form">
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-group"><label>Idioma *</label><input required value={langForm.name} onChange={e=>setLangForm(f=>({...f,name:e.target.value}))} placeholder="Ex: Inglês" /></div>
          <div className="form-group"><label>Nível</label>
            <select value={langForm.level} onChange={e=>setLangForm(f=>({...f,level:e.target.value}))}>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary modal-submit" disabled={saving}>{saving ? 'Adicionando...' : 'Adicionar'}</button>
        </form>
      </Modal>

      {/* HABILIDADE */}
      <Modal open={modal==='skill'} title="💻 Adicionar Habilidade" onClose={closeModal}>
        <form onSubmit={addSkill} className="modal-form">
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-group"><label>Habilidade *</label><input required value={skillForm.name} onChange={e=>setSkillForm(f=>({...f,name:e.target.value}))} placeholder="Ex: React, Node.js, Python..." /></div>
          <button type="submit" className="btn-primary modal-submit" disabled={saving}>{saving ? 'Adicionando...' : 'Adicionar'}</button>
        </form>
      </Modal>

      {/* PROJETO */}
      <Modal open={modal==='proj'} title="🚀 Adicionar Projeto" onClose={closeModal}>
        <form onSubmit={addProj} className="modal-form">
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-row">
            <div className="form-group"><label>Título *</label><input required value={projForm.title} onChange={e=>setProjForm(f=>({...f,title:e.target.value}))} placeholder="Nome do projeto" /></div>
            <div className="form-group"><label>Categoria</label><input value={projForm.category} onChange={e=>setProjForm(f=>({...f,category:e.target.value}))} placeholder="Ex: Full Stack" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Data</label><input value={projForm.date} onChange={e=>setProjForm(f=>({...f,date:e.target.value}))} placeholder="Ex: Mar 2024" /></div>
            <div className="form-group"><label>GitHub URL</label><input value={projForm.github} onChange={e=>setProjForm(f=>({...f,github:e.target.value}))} placeholder="https://github.com/..." /></div>
          </div>
          <div className="form-group"><label>Imagem (URL)</label><input value={projForm.image} onChange={e=>setProjForm(f=>({...f,image:e.target.value}))} placeholder="https://..." /></div>
          <div className="form-group"><label>Descrição</label><textarea rows={3} value={projForm.description} onChange={e=>setProjForm(f=>({...f,description:e.target.value}))} placeholder="Descreva o projeto..." /></div>
          <div className="form-group"><label>Tags (separadas por vírgula)</label><input value={projForm.tags} onChange={e=>setProjForm(f=>({...f,tags:e.target.value}))} placeholder="React, Node.js, AWS" /></div>
          <button type="submit" className="btn-primary modal-submit" disabled={saving}>{saving ? 'Adicionando...' : 'Adicionar projeto'}</button>
        </form>
      </Modal>

      {/* CERTIFICADO */}
      <Modal open={modal==='cert'} title="🏆 Adicionar Certificado" onClose={closeModal}>
        <form onSubmit={addCert} className="modal-form">
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-group"><label>Título *</label><input required value={certForm.title} onChange={e=>setCertForm(f=>({...f,title:e.target.value}))} placeholder="Nome do certificado" /></div>
          <div className="form-row">
            <div className="form-group"><label>Emissor</label><input value={certForm.issuer} onChange={e=>setCertForm(f=>({...f,issuer:e.target.value}))} placeholder="Ex: AWS, Google..." /></div>
            <div className="form-group"><label>Data</label><input value={certForm.date} onChange={e=>setCertForm(f=>({...f,date:e.target.value}))} placeholder="Ex: Jan 2024" /></div>
          </div>
          <div className="form-group"><label>URL da credencial</label><input value={certForm.credential_url} onChange={e=>setCertForm(f=>({...f,credential_url:e.target.value}))} placeholder="https://..." /></div>
          <div className="form-group"><label>Imagem (URL)</label><input value={certForm.image} onChange={e=>setCertForm(f=>({...f,image:e.target.value}))} placeholder="https://..." /></div>
          <button type="submit" className="btn-primary modal-submit" disabled={saving}>{saving ? 'Adicionando...' : 'Adicionar certificado'}</button>
        </form>
      </Modal>
    </div>
  )
}
