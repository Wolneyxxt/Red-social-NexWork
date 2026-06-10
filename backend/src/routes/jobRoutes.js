const router = require('express').Router()
const auth = require('../middlewares/authMiddleware')
const supabase = require('../config/supabase')

// Listar vagas
router.get('/', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})

// Criar vaga
router.post('/', auth, async (req, res) => {
  const { title, company, location, type, level, salary, description, tags } = req.body
  const { data, error } = await supabase
    .from('jobs')
    .insert({ title, company, location, type, level, salary, description, tags })
    .select()
    .single()

  if (error) return res.status(500).json({ msg: error.message })
  res.status(201).json(data)
})

// Candidatar-se a uma vaga
router.post('/:id/apply', auth, async (req, res) => {
  const { error } = await supabase
    .from('job_applications')
    .insert({ job_id: req.params.id, user_id: req.userId })

  if (error) {
    if (error.code === '23505') return res.status(400).json({ msg: 'Você já se candidatou a esta vaga.' })
    return res.status(500).json({ msg: error.message })
  }
  res.status(201).json({ msg: 'Candidatura enviada!' })
})

// Cancelar candidatura
router.delete('/:id/apply', auth, async (req, res) => {
  const { error } = await supabase
    .from('job_applications')
    .delete()
    .eq('job_id', req.params.id)
    .eq('user_id', req.userId)

  if (error) return res.status(500).json({ msg: error.message })
  res.json({ msg: 'Candidatura cancelada.' })
})

// Listar vagas que eu me candidatei
router.get('/my-applications', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('job_applications')
    .select('job_id')
    .eq('user_id', req.userId)

  if (error) return res.status(500).json({ msg: error.message })
  res.json(data.map(a => a.job_id))
})

// Listar candidatos de uma vaga (só para recrutadores)
router.get('/:id/applications', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('job_applications')
    .select('user_id, created_at, profiles(name, avatar, role, company)')
    .eq('job_id', req.params.id)

  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})

module.exports = router
