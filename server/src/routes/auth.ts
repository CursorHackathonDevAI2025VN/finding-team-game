import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { store } from '../db/store'
import { RegisterRequest, LoginRequest, JWTPayload, User } from '../types'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'hackathon-secret-key-2024'

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, position, skills }: RegisterRequest = req.body

    // Check if user exists
    const existingUser = store.getUserByEmail(email)
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user: User = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role,
      position,
      skills,
      createdAt: new Date().toISOString()
    }

    store.createUser(user)

    // Generate token
    const payload: JWTPayload = { userId: user.id, role: user.role }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })

    // Return without password
    const { password: _, ...userWithoutPassword } = user

    res.status(201).json({
      success: true,
      data: { token, user: userWithoutPassword }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ success: false, error: 'Registration failed' })
  }
})

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body

    // Find user
    const user = store.getUserByEmail(email)
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    // Generate token
    const payload: JWTPayload = { userId: user.id, role: user.role }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })

    // Return without password
    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      data: { token, user: userWithoutPassword }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, error: 'Login failed' })
  }
})

// Get current user
router.get('/me', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload

    const user = store.getUserById(decoded.userId)
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    const { password: _, ...userWithoutPassword } = user

    res.json({ success: true, data: userWithoutPassword })
  } catch (error) {
    console.error('Auth error:', error)
    res.status(401).json({ success: false, error: 'Invalid token' })
  }
})

export default router

