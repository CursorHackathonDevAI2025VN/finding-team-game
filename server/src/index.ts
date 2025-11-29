import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import usersRoutes from './routes/users'
import teamsRoutes from './routes/teams'
import matchRoutes from './routes/match'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/teams', teamsRoutes)
app.use('/api/match', matchRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

