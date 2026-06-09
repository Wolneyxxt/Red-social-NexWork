const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

// CORS restrito ao frontend local (em produção, troque pela URL do seu domínio)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())

app.use('/api/auth', require('./src/routes/authRoutes'))
app.use('/api/users', require('./src/routes/userRoutes'))
app.use('/api/posts', require('./src/routes/postRoutes'))
app.use('/api/jobs', require('./src/routes/jobRoutes'))
app.use('/api/upload', require('./src/routes/uploadRoutes'))

app.get('/', (req, res) => res.json({ status: 'NexWork API rodando!' }))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
