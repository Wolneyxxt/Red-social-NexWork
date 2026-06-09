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

module.exports = router
