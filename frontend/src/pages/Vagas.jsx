import { useState, useEffect } from 'react'
import api from '../services/api'
import './Vagas.css'

const MOCK_JOBS = [
  {
    id: '1', title: 'Senior Full Stack Developer', company: 'Tech Innovations',
    location: 'São Paulo, SP (Remoto)', type: 'CLT', salary: 'R$ 15.000 - R$ 20.000',
    description: 'Procuramos desenvolvedor full stack experiente para liderar projetos de alta complexidade usando React, Node.js e AWS.',
    tags: ['React', 'Node.js', 'AWS', 'Docker', 'TypeScript'], candidates: 47, days: 2
  },
  {
    id: '2', title: 'Machine Learning Engineer', company: 'AI Solutions',
    location: 'Rio de Janeiro, RJ (Híbrido)', type: 'CLT', salary: 'R$ 18.000 - R$ 25.000',
    description: 'Oportunidade para trabalhar com modelos de ML em produção, processamento de grandes volumes de dados e MLOps.',
    tags: ['Python', 'TensorFlow', 'PyTorch', 'AWS', 'MLOps'], candidates: 89, days: 7
  },
  {
    id: '3', title: 'DevOps Engineer', company: 'CloudStack',
    location: 'Remoto', type: 'PJ', salary: 'R$ 12.000 - R$ 18.000',
    description: 'Buscamos profissional para atuar com infraestrutura em nuvem, CI/CD e automação de processos.',
    tags: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Jenkins'], candidates: 31, days: 3
  },
  {
    id: '4', title: 'UX/UI Designer', company: 'Creative Studio',
    location: 'Belo Horizonte, MG (Híbrido)', type: 'CLT', salary: 'R$ 8.000 - R$ 12.000',
    description: 'Procuramos designer criativo para criar experiências digitais incríveis para nossos clientes.',
    tags: ['Figma', 'Design Systems', 'Prototyping', 'Adobe XD'], candidates: 55, days: 5
  },
  {
    id: '5', title: 'Backend Developer', company: 'Fintech Corp',
    location: 'São Paulo, SP (Presencial)', type: 'CLT', salary: 'R$ 10.000 - R$ 15.000',
    description: 'Vaga para desenvolvedor backend focado em sistemas financeiros de alta disponibilidade.',
    tags: ['Java', 'Spring Boot', 'PostgreSQL', 'Kafka'], candidates: 28, days: 1
  },
  {
    id: '6', title: 'Data Scientist', company: 'Data Analytics Inc',
    location: 'Remoto', type: 'Freela', salary: 'R$ 200/hora',
    description: 'Projeto de 6 meses para análise de dados e criação de modelos preditivos para e-commerce.',
    tags: ['Python', 'SQL', 'Machine Learning', 'Tableau'], candidates: 42, days: 4
  },
]

const TIPOS = ['CLT', 'PJ', 'Freela', 'Estágio']
const NIVEIS = ['Júnior', 'Pleno', 'Sênior', 'Tech Lead']
const SKILLS = ['React', 'Node.js', 'Python', 'AWS', 'Docker']

export default function Vagas() {
  const [jobs, setJobs] = useState(MOCK_JOBS)
  const [search, setSearch] = useState('')
  const [tipos, setTipos] = useState([])
  const [niveis, setNiveis] = useState([])
  const [saved, setSaved] = useState([])

  useEffect(() => {
    api.get('/jobs').then(r => {
      if (r.data.length > 0) setJobs(r.data)
    }).catch(() => {})
  }, [])

  const toggleTipo = t => setTipos(v => v.includes(t) ? v.filter(x => x !== t) : [...v, t])
  const toggleNivel = n => setNiveis(v => v.includes(n) ? v.filter(x => x !== n) : [...v, n])
  const toggleSaved = id => setSaved(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id])

  const filtered = jobs.filter(j => {
    const matchSearch = !search ||
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.company?.toLowerCase().includes(search.toLowerCase()) ||
      j.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchTipo = tipos.length === 0 || tipos.includes(j.type)
    const matchNivel = niveis.length === 0 || niveis.includes(j.level)
    return matchSearch && matchTipo && matchNivel
  })

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
          <label>Localização</label>
          <select>
            <option>Todas</option>
            <option>Remoto</option>
            <option>São Paulo</option>
            <option>Rio de Janeiro</option>
          </select>
        </div>

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

        <div className="filter-group">
          <label>Habilidades</label>
          <div className="filter-tags">
            {SKILLS.map(s => (
              <span key={s} className="tag" style={{cursor:'pointer'}}>{s}</span>
            ))}
          </div>
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
        </div>

        <div className="vagas-count">
          <span>{filtered.length} vagas encontradas</span>
        </div>

        {filtered.map(job => (
          <div key={job.id} className="job-card card">
            <div className="job-header">
              <div className="job-logo" style={{background: stringToColor(job.company)}}>
                {job.company?.slice(0,2).toUpperCase()}
              </div>
              <div className="job-info">
                <h3>{job.title}</h3>
                <p className="job-company">{job.company}</p>
                <div className="job-meta">
                  <span>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {job.location}
                  </span>
                  <span>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    {job.type}
                  </span>
                  {job.salary && (
                    <span>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                      {job.salary}
                    </span>
                  )}
                  <span>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {job.days || job.days_ago} {typeof job.days === 'number' ? `dias atrás` : ''}
                  </span>
                </div>
              </div>
              <button className="save-btn" onClick={() => toggleSaved(job.id)}>
                <svg width="18" height="18" fill={saved.includes(job.id) ? 'var(--brand)' : 'none'} stroke={saved.includes(job.id) ? 'var(--brand)' : 'currentColor'} strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </div>

            <p className="job-description">{job.description}</p>

            <div className="job-tags">
              {job.tags?.map(t => <span key={t} className="tag">{t}</span>)}
            </div>

            <div className="job-footer">
              <span className="job-candidates">{job.candidates} candidatos</span>
              <a href="#" className="btn-primary" style={{fontSize:13, padding:'8px 20px'}}>
                Candidatar-se
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}

function stringToColor(str = '') {
  const colors = ['#5B4FE8','#06B6D4','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899']
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}
