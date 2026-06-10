const router = require('express').Router()
const auth = require('../middlewares/authMiddleware')
const supabase = require('../config/supabase')

// Meu perfil completo
router.get('/me', auth, async (req, res) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', req.userId).single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})

// Listar todos usuários
router.get('/', auth, async (req, res) => {
  const { data, error } = await supabase.from('profiles').select('*').neq('id', req.userId).limit(20)
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})

// Atualizar perfil
router.put('/me', auth, async (req, res) => {
  const { name, role, company, bio, avatar, banner, location, website } = req.body
  const { data, error } = await supabase
    .from('profiles').update({ name, role, company, bio, avatar, banner, location, website })
    .eq('id', req.userId).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})

// Alterar senha
router.put('/me/password', auth, async (req, res) => {
  const { newPassword } = req.body
  if (!newPassword || newPassword.length < 6)
    return res.status(400).json({ msg: 'Mínimo 6 caracteres' })

  // Usa a service_role key para ter permissão de alterar senha
  const { createClient } = require('@supabase/supabase-js')
  const adminClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )
  const { error } = await adminClient.auth.admin.updateUserById(req.userId, { password: newPassword })
  if (error) return res.status(500).json({ msg: error.message })
  res.json({ msg: 'Senha alterada com sucesso' })
})

// --- FORMAÇÃO ---
router.get('/me/education', auth, async (req, res) => {
  const { data } = await supabase.from('education').select('*').eq('user_id', req.userId).order('year_start', { ascending: false })
  res.json(data || [])
})
router.post('/me/education', auth, async (req, res) => {
  const { degree, institution, year_start, year_end, status } = req.body
  const { data, error } = await supabase.from('education').insert({ user_id: req.userId, degree, institution, year_start, year_end, status }).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.status(201).json(data)
})
router.delete('/me/education/:id', auth, async (req, res) => {
  await supabase.from('education').delete().eq('id', req.params.id).eq('user_id', req.userId)
  res.json({ msg: 'ok' })
})

// --- IDIOMAS ---
router.get('/me/languages', auth, async (req, res) => {
  const { data } = await supabase.from('languages').select('*').eq('user_id', req.userId)
  res.json(data || [])
})
router.post('/me/languages', auth, async (req, res) => {
  const { name, level } = req.body
  const { data, error } = await supabase.from('languages').insert({ user_id: req.userId, name, level }).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.status(201).json(data)
})
router.delete('/me/languages/:id', auth, async (req, res) => {
  await supabase.from('languages').delete().eq('id', req.params.id).eq('user_id', req.userId)
  res.json({ msg: 'ok' })
})

// --- HABILIDADES ---
router.get('/me/skills', auth, async (req, res) => {
  const { data } = await supabase.from('skills').select('*').eq('user_id', req.userId)
  res.json(data || [])
})
router.post('/me/skills', auth, async (req, res) => {
  const { name } = req.body
  const { data, error } = await supabase.from('skills').insert({ user_id: req.userId, name }).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.status(201).json(data)
})
router.delete('/me/skills/:id', auth, async (req, res) => {
  await supabase.from('skills').delete().eq('id', req.params.id).eq('user_id', req.userId)
  res.json({ msg: 'ok' })
})

// --- PROJETOS ---
router.get('/me/projects', auth, async (req, res) => {
  const { data } = await supabase.from('projects').select('*').eq('user_id', req.userId).order('created_at', { ascending: false })
  res.json(data || [])
})
router.post('/me/projects', auth, async (req, res) => {
  const { title, category, date, description, image, github, tags } = req.body
  const { data, error } = await supabase.from('projects').insert({ user_id: req.userId, title, category, date, description, image, github, tags }).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.status(201).json(data)
})
router.delete('/me/projects/:id', auth, async (req, res) => {
  await supabase.from('projects').delete().eq('id', req.params.id).eq('user_id', req.userId)
  res.json({ msg: 'ok' })
})

// --- CERTIFICADOS ---
router.get('/me/certificates', auth, async (req, res) => {
  const { data } = await supabase.from('certificates').select('*').eq('user_id', req.userId).order('created_at', { ascending: false })
  res.json(data || [])
})
router.post('/me/certificates', auth, async (req, res) => {
  const { title, issuer, date, credential_url, image } = req.body
  const { data, error } = await supabase.from('certificates').insert({ user_id: req.userId, title, issuer, date, credential_url, image }).select().single()
  if (error) return res.status(500).json({ msg: error.message })
  res.status(201).json(data)
})
router.delete('/me/certificates/:id', auth, async (req, res) => {
  await supabase.from('certificates').delete().eq('id', req.params.id).eq('user_id', req.userId)
  res.json({ msg: 'ok' })
})

// --- FOLLOWS ---

// Listar quem eu sigo (retorna array de IDs)
router.get('/me/following', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', req.userId)
  if (error) return res.status(500).json({ msg: error.message })
  res.json(data.map(f => f.following_id))
})

// Seguir usuário
router.post('/follow/:id', auth, async (req, res) => {
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: req.userId, following_id: req.params.id })
  if (error) return res.status(500).json({ msg: error.message })
  res.json({ msg: 'Seguindo' })
})

// Deixar de seguir
router.delete('/follow/:id', auth, async (req, res) => {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', req.userId)
    .eq('following_id', req.params.id)
  if (error) return res.status(500).json({ msg: error.message })
  res.json({ msg: 'Deixou de seguir' })
})

module.exports = router
