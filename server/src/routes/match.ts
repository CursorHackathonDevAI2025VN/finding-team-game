import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { store } from '../db/store'
import { getMatchSuggestions } from '../services/groq'
import { JWTPayload, MatchRequest } from '../types'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'hackathon-secret-key-2024'

// Middleware to get user from token
const getUserFromToken = (req: Request): JWTPayload | null => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null
    const token = authHeader.split(' ')[1]
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// Get match suggestions
router.post('/', async (req: Request, res: Response) => {
  try {
    const payload = getUserFromToken(req)
    if (!payload) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { position, skills }: MatchRequest = req.body

    if (!position || !skills || skills.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Position and skills are required' 
      })
    }

    const isLeader = payload.role === 'leader'
    
    // Get candidates based on role
    // Leaders look for members, members look for leaders
    const targetRole = isLeader ? 'member' : 'leader'
    const allUsers = store.getUsersByRole(targetRole)
    
    // Filter to exclude current user and users already in teams
    const candidates = allUsers
      .filter(u => u.id !== payload.userId)
      .map(({ password, ...user }) => user)

    const suggestions = await getMatchSuggestions({
      position,
      skills,
      candidates,
      isLeaderLooking: isLeader
    })

    res.json({ success: true, data: { suggestions } })
  } catch (error) {
    console.error('Match error:', error)
    res.status(500).json({ success: false, error: 'Failed to get matches' })
  }
})

export default router

