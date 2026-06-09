const supabase = require('../config/supabase')

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ msg: 'Token não fornecido' })

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return res.status(401).json({ msg: 'Token inválido' })

  req.userId = data.user.id
  req.user = data.user
  next()
}
