import { Router, Request, Response } from 'express'
import { store } from '../db/store'

const router = Router()

// Get all users
router.get('/', (req: Request, res: Response) => {
  try {
    const { role, position } = req.query
    
    let users = store.getAllUsers()
    
    if (role) {
      users = users.filter(u => u.role === role)
    }
    
    if (position) {
      users = users.filter(u => u.position === position)
    }

    // Remove passwords
    const usersWithoutPasswords = users.map(({ password, ...user }) => user)

    res.json({ success: true, data: usersWithoutPasswords })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ success: false, error: 'Failed to get users' })
  }
})

// Get user by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const user = store.getUserById(req.params.id)
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    const { password, ...userWithoutPassword } = user
    res.json({ success: true, data: userWithoutPassword })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ success: false, error: 'Failed to get user' })
  }
})

// Update user profile
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { name, position, skills, description } = req.body
    
    const updated = store.updateUser(req.params.id, { name, position, skills, description })
    
    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    const { password, ...userWithoutPassword } = updated
    res.json({ success: true, data: userWithoutPassword })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ success: false, error: 'Failed to update user' })
  }
})

export default router

