const router = require('express').Router()
const auth = require('../middlewares/authMiddleware')
const { getAdminClient } = require('../utils/notifications')

// Listar minhas notificações
router.get('/', auth, async (req, res) => {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from('notifications')
    .select(`
      *,
      actor:profiles!notifications_actor_id_fkey(id, name, avatar, role, company, account_type, recruiter_company)
    `)
    .eq('recipient_id', req.userId)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) return res.status(500).json({ msg: error.message })
  res.json(data || [])
})

// Quantidade de notificações não lidas
router.get('/unread-count', auth, async (req, res) => {
  const admin = getAdminClient()
  const { count, error } = await admin
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', req.userId)
    .eq('read', false)

  if (error) return res.status(500).json({ msg: error.message })
  res.json({ count: count || 0 })
})

// Marcar todas como lidas
router.put('/read-all', auth, async (req, res) => {
  const admin = getAdminClient()
  const { error } = await admin
    .from('notifications')
    .update({ read: true })
    .eq('recipient_id', req.userId)
    .eq('read', false)

  if (error) return res.status(500).json({ msg: error.message })
  res.json({ msg: 'Notificações marcadas como lidas' })
})

// Marcar uma como lida
router.put('/:id/read', auth, async (req, res) => {
  const admin = getAdminClient()
  const { error } = await admin
    .from('notifications')
    .update({ read: true })
    .eq('id', req.params.id)
    .eq('recipient_id', req.userId)

  if (error) return res.status(500).json({ msg: error.message })
  res.json({ msg: 'Notificação marcada como lida' })
})

module.exports = router
