const router = require('express').Router()
const auth = require('../middlewares/authMiddleware')
const { createClient } = require('@supabase/supabase-js')

const getAdminClient = () =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// Upload de mídia (imagem ou vídeo)
router.post('/', auth, async (req, res) => {
  try {
    const { base64, fileName, mimeType } = req.body

    if (!base64 || !fileName || !mimeType) {
      return res.status(400).json({ msg: 'Dados de upload incompletos.' })
    }

    // Valida tipo
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/mov']
    if (!allowed.includes(mimeType)) {
      return res.status(400).json({ msg: 'Tipo de arquivo não permitido.' })
    }

    // Limite: imagens 10MB, vídeos 100MB
    const buffer = Buffer.from(base64, 'base64')
    const isVideo = mimeType.startsWith('video/')
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024
    if (buffer.length > maxSize) {
      return res.status(400).json({ msg: isVideo ? 'Vídeo muito grande. Máximo 100MB.' : 'Imagem muito grande. Máximo 10MB.' })
    }

    const ext = fileName.split('.').pop().toLowerCase()
    const uniqueName = `${req.userId}/${Date.now()}.${ext}`
    const folder = isVideo ? 'videos' : 'images'
    const path = `${folder}/${uniqueName}`

    const adminClient = getAdminClient()

    const { error: uploadError } = await adminClient.storage
      .from('media')
      .upload(path, buffer, {
        contentType: mimeType,
        upsert: false
      })

    if (uploadError) {
      console.error('Erro no upload:', uploadError.message)
      return res.status(500).json({ msg: 'Erro ao fazer upload: ' + uploadError.message })
    }

    const { data: urlData } = adminClient.storage.from('media').getPublicUrl(path)

    res.json({
      url: urlData.publicUrl,
      type: isVideo ? 'video' : 'image'
    })
  } catch (err) {
    console.error('Erro no upload:', err)
    res.status(500).json({ msg: 'Erro no servidor' })
  }
})

module.exports = router
