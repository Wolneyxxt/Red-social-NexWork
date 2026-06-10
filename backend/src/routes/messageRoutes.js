const router = require('express').Router()
const auth = require('../middlewares/authMiddleware')
const supabase = require('../config/supabase')

// Pegar ou criar conversa entre dois usuários
async function getOrCreateConversation(user1, user2) {
  // Tenta achar nos dois sentidos
  let { data } = await supabase
    .from('conversations')
    .select('*')
    .or(`and(user1_id.eq.${user1},user2_id.eq.${user2}),and(user1_id.eq.${user2},user2_id.eq.${user1})`)
    .single()

  if (data) return data

  const { data: created } = await supabase
    .from('conversations')
    .insert({ user1_id: user1, user2_id: user2 })
    .select()
    .single()

  return created
}

// Listar conversas do usuário logado
router.get('/', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id, created_at,
      user1:profiles!conversations_user1_id_fkey(id, name, avatar, role),
      user2:profiles!conversations_user2_id_fkey(id, name, avatar, role)
    `)
    .or(`user1_id.eq.${req.userId},user2_id.eq.${req.userId}`)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ msg: error.message })

  // Para cada conversa, busca a última mensagem
  const result = await Promise.all((data || []).map(async (conv) => {
    const { data: lastMsg } = await supabase
      .from('chat_messages')
      .select('text, created_at, sender_id')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const other = conv.user1.id === req.userId ? conv.user2 : conv.user1
    return { ...conv, other, lastMessage: lastMsg || null }
  }))

  res.json(result)
})

// Buscar mensagens de uma conversa
router.get('/:conversationId/messages', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, text, sender_id, created_at')
    .eq('conversation_id', req.params.conversationId)
    .order('created_at', { ascending: true })

  if (error) return res.status(500).json({ msg: error.message })
  res.json(data || [])
})

// Iniciar ou abrir conversa com um usuário
router.post('/with/:userId', auth, async (req, res) => {
  const conv = await getOrCreateConversation(req.userId, req.params.userId)
  if (!conv) return res.status(500).json({ msg: 'Erro ao criar conversa' })
  res.json(conv)
})

// Enviar mensagem
router.post('/:conversationId/messages', auth, async (req, res) => {
  const { text } = req.body
  if (!text?.trim()) return res.status(400).json({ msg: 'Mensagem vazia' })

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ conversation_id: req.params.conversationId, sender_id: req.userId, text: text.trim() })
    .select()
    .single()

  if (error) return res.status(500).json({ msg: error.message })
  res.status(201).json(data)
})

module.exports = router
