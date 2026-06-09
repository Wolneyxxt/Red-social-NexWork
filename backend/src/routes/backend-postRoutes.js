const router = require('express').Router()
const auth = require('../middlewares/authMiddleware')
const Post = require('../models/Post')

// Listar todos os posts
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name avatar role company')
      .sort({ createdAt: -1 })
    res.json(posts)
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao buscar posts' })
  }
})

// Criar post
router.post('/', auth, async (req, res) => {
  try {
    const { content, title, tags, image } = req.body
    const post = await Post.create({
      author: req.userId,
      content,
      title: title || '',
      tags: tags || [],
      image: image || ''
    })
    const populated = await post.populate('author', 'name avatar role company')
    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao criar post' })
  }
})

// Curtir / descurtir post
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'Post não encontrado' })

    const liked = post.likes.includes(req.userId)
    if (liked) {
      post.likes = post.likes.filter(id => id.toString() !== req.userId)
    } else {
      post.likes.push(req.userId)
    }
    await post.save()
    res.json({ likes: post.likes.length, liked: !liked })
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao curtir post' })
  }
})

// Comentar em post
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'Post não encontrado' })

    post.comments.push({ user: req.userId, text: req.body.text })
    await post.save()
    res.status(201).json(post.comments)
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao comentar' })
  }
})

// Deletar post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'Post não encontrado' })
    if (post.author.toString() !== req.userId)
      return res.status(403).json({ msg: 'Não autorizado' })

    await post.deleteOne()
    res.json({ msg: 'Post deletado' })
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao deletar post' })
  }
})

module.exports = router
