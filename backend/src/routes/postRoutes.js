const router = require('express').Router()
const auth = require('../middlewares/authMiddleware')
const supabase = require('../config/supabase')
const { createNotification } = require('../utils/notifications')

// Listar posts
router.get('/', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, name, avatar, role, company, account_type, recruiter_company),
      likes(user_id),
      comments(id, text, created_at, user_id, user:profiles!comments_user_id_fkey(id, name, avatar, account_type, recruiter_company, company))
    `)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ msg: error.message })
  res.json(data)
})

// Criar post — apenas users comuns
router.post('/', auth, async (req, res) => {
  // Verifica se é usuário comum
  const { data: profile } = await supabase
    .from('profiles')
    .select('account_type')
    .eq('id', req.userId)
    .single()

  if (profile?.account_type === 'recruiter') {
    return res.status(403).json({ msg: 'Recrutadores não podem publicar posts no feed. Use a seção de Vagas.' })
  }

  const { content, title, tags, image, video, media_type } = req.body
  const { data, error } = await supabase
    .from('posts')
    .insert({ author_id: req.userId, content, title, tags, image, video, media_type })
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, name, avatar, role, company, account_type, recruiter_company),
      likes(user_id),
      comments(id, text, created_at, user_id, user:profiles!comments_user_id_fkey(id, name, avatar, account_type, recruiter_company, company))
    `)
    .single()

  if (error) return res.status(500).json({ msg: error.message })
  res.status(201).json(data)
})

// Curtir / descurtir — qualquer conta pode curtir
router.put('/:id/like', auth, async (req, res) => {
  const { id } = req.params
  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', req.userId)
    .eq('post_id', id)
    .single()

  if (existing) {
    await supabase.from('likes').delete().eq('user_id', req.userId).eq('post_id', id)
    return res.json({ liked: false })
  } else {
    const { error: likeError } = await supabase.from('likes').insert({ user_id: req.userId, post_id: id })
    if (likeError) return res.status(500).json({ msg: likeError.message })

    const { data: post } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single()

    await createNotification({
      recipientId: post?.author_id,
      actorId: req.userId,
      type: 'like',
      title: 'Nova curtida',
      message: 'curtiu sua publicação.',
      link: '/feed',
      metadata: { post_id: id },
    })

    return res.json({ liked: true })
  }
})

// Comentar — qualquer conta pode comentar
router.post('/:id/comments', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('comments')
    .insert({ user_id: req.userId, post_id: req.params.id, text: req.body.text })
    .select(`id, text, created_at, user_id, user:profiles!comments_user_id_fkey(id, name, avatar, account_type, recruiter_company, company)`)
    .single()

  if (error) return res.status(500).json({ msg: error.message })

  const { data: post } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', req.params.id)
    .single()

  await createNotification({
    recipientId: post?.author_id,
    actorId: req.userId,
    type: 'comment',
    title: 'Novo comentário',
    message: 'comentou na sua publicação.',
    link: '/feed',
    metadata: { post_id: req.params.id, comment_id: data?.id },
  })

  res.status(201).json(data)
})

// Deletar comentário
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', req.params.commentId)
    .eq('user_id', req.userId)

  if (error) return res.status(500).json({ msg: error.message })
  res.json({ msg: 'Comentário deletado' })
})

// Deletar post
router.delete('/:id', auth, async (req, res) => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', req.params.id)
    .eq('author_id', req.userId)

  if (error) return res.status(500).json({ msg: error.message })
  res.json({ msg: 'Post deletado' })
})

module.exports = router
