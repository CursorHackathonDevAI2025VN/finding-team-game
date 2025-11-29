import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import { store } from '../db/store'
import { Team, Slot, JWTPayload, Position } from '../types'

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

// Get all teams
router.get('/', (req: Request, res: Response) => {
  try {
    const teams = store.getAllTeams()
    res.json({ success: true, data: teams })
  } catch (error) {
    console.error('Get teams error:', error)
    res.status(500).json({ success: false, error: 'Failed to get teams' })
  }
})

// Get team by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const team = store.getTeamById(req.params.id)
    
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' })
    }

    res.json({ success: true, data: team })
  } catch (error) {
    console.error('Get team error:', error)
    res.status(500).json({ success: false, error: 'Failed to get team' })
  }
})

// Get current user's team
router.get('/my/team', (req: Request, res: Response) => {
  try {
    const payload = getUserFromToken(req)
    if (!payload) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const team = store.getTeamByLeaderId(payload.userId)
    res.json({ success: true, data: team || null })
  } catch (error) {
    console.error('Get my team error:', error)
    res.status(500).json({ success: false, error: 'Failed to get team' })
  }
})

// Get invitations for current user (teams that have invited them)
router.get('/invitations', (req: Request, res: Response) => {
  try {
    const payload = getUserFromToken(req)
    if (!payload) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const allTeams = store.getAllTeams()
    const invitations: Array<{
      teamId: string
      teamName: string
      slotId: string
      position: Position
      skills: string[]
      leaderId: string
    }> = []

    allTeams.forEach(team => {
      team.slots.forEach(slot => {
        if (slot.memberId === payload.userId) {
          invitations.push({
            teamId: team.id,
            teamName: team.name,
            slotId: slot.id,
            position: slot.position,
            skills: slot.skills,
            leaderId: team.leaderId
          })
        }
      })
    })

    res.json({ success: true, data: invitations })
  } catch (error) {
    console.error('Get invitations error:', error)
    res.status(500).json({ success: false, error: 'Failed to get invitations' })
  }
})

// Create team (leaders only)
router.post('/', (req: Request, res: Response) => {
  try {
    const payload = getUserFromToken(req)
    if (!payload) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    if (payload.role !== 'leader') {
      return res.status(403).json({ success: false, error: 'Only leaders can create teams' })
    }

    // Check if leader already has a team
    const existingTeam = store.getTeamByLeaderId(payload.userId)
    if (existingTeam) {
      return res.status(400).json({ success: false, error: 'You already have a team' })
    }

    const { name } = req.body

    const team: Team = {
      id: uuidv4(),
      name: name || 'My Team',
      leaderId: payload.userId,
      slots: [],
      createdAt: new Date().toISOString()
    }

    store.createTeam(team)
    res.status(201).json({ success: true, data: team })
  } catch (error) {
    console.error('Create team error:', error)
    res.status(500).json({ success: false, error: 'Failed to create team' })
  }
})

// Add slot to team
router.post('/:id/slots', (req: Request, res: Response) => {
  try {
    const payload = getUserFromToken(req)
    if (!payload) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Only leaders can add slots
    if (payload.role !== 'leader') {
      return res.status(403).json({ success: false, error: 'Only leaders can add slots' })
    }

    const team = store.getTeamById(req.params.id)
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' })
    }

    if (team.leaderId !== payload.userId) {
      return res.status(403).json({ success: false, error: 'Not your team' })
    }

    const { position, skills } = req.body

    // Validate position if provided
    if (position && !['frontend', 'backend', 'design', 'business'].includes(position)) {
      return res.status(400).json({ success: false, error: 'Invalid position' })
    }

    // Create new slot
    const newSlot: Slot = {
      id: uuidv4(),
      position: position || 'frontend', // Default to frontend if not provided
      skills: skills || []
    }

    // Add slot to team
    const updatedTeam = store.updateTeam(team.id, {
      slots: [...team.slots, newSlot]
    })

    if (!updatedTeam) {
      return res.status(500).json({ success: false, error: 'Failed to update team' })
    }

    res.status(201).json({ success: true, data: updatedTeam })
  } catch (error) {
    console.error('Add slot error:', error)
    res.status(500).json({ success: false, error: 'Failed to add slot' })
  }
})

// Update slot
router.put('/:teamId/slots/:slotId', (req: Request, res: Response) => {
  try {
    const payload = getUserFromToken(req)
    if (!payload) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const team = store.getTeamById(req.params.teamId)
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' })
    }

    if (team.leaderId !== payload.userId) {
      return res.status(403).json({ success: false, error: 'Not your team' })
    }

    const { position, skills, memberId } = req.body
    const slotIndex = team.slots.findIndex(s => s.id === req.params.slotId)
    
    if (slotIndex === -1) {
      return res.status(404).json({ success: false, error: 'Slot not found' })
    }

    const updatedSlots = [...team.slots]
    updatedSlots[slotIndex] = {
      ...updatedSlots[slotIndex],
      ...(position && { position }),
      ...(skills && { skills }),
      ...(memberId !== undefined && { memberId })
    }

    const updatedTeam = store.updateTeam(team.id, { slots: updatedSlots })
    res.json({ success: true, data: updatedTeam })
  } catch (error) {
    console.error('Update slot error:', error)
    res.status(500).json({ success: false, error: 'Failed to update slot' })
  }
})

// Invite member to slot
router.post('/:teamId/slots/:slotId/invite', (req: Request, res: Response) => {
  try {
    const payload = getUserFromToken(req)
    if (!payload) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // Only leaders can invite members
    if (payload.role !== 'leader') {
      return res.status(403).json({ success: false, error: 'Only leaders can invite members' })
    }

    const team = store.getTeamById(req.params.teamId)
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' })
    }

    if (team.leaderId !== payload.userId) {
      return res.status(403).json({ success: false, error: 'Not your team' })
    }

    const slotIndex = team.slots.findIndex(s => s.id === req.params.slotId)
    if (slotIndex === -1) {
      return res.status(404).json({ success: false, error: 'Slot not found' })
    }

    const { memberId } = req.body
    if (!memberId) {
      return res.status(400).json({ success: false, error: 'memberId is required' })
    }

    // Check if member exists and is actually a member (not a leader)
    const member = store.getUserById(memberId)
    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' })
    }

    if (member.role !== 'member') {
      return res.status(400).json({ success: false, error: 'Can only invite members, not leaders' })
    }

    // Check if member is already in a team
    if (member.teamId && member.teamId !== team.id) {
      return res.status(400).json({ success: false, error: 'Member is already in another team' })
    }

    // Check if slot already has a different member
    const currentSlot = team.slots[slotIndex]
    if (currentSlot.memberId && currentSlot.memberId !== memberId) {
      return res.status(400).json({ success: false, error: 'Slot already has a member assigned' })
    }

    // If member is already invited to this slot, return success (idempotent)
    if (currentSlot.memberId === memberId) {
      return res.status(200).json({ success: true, data: team, message: 'Member already invited to this slot' })
    }

    // Update slot with memberId
    const updatedSlots = [...team.slots]
    updatedSlots[slotIndex] = {
      ...updatedSlots[slotIndex],
      memberId: memberId
    }

    // Update member's teamId
    store.updateUser(memberId, { teamId: team.id })

    const updatedTeam = store.updateTeam(team.id, { slots: updatedSlots })
    if (!updatedTeam) {
      return res.status(500).json({ success: false, error: 'Failed to update team' })
    }

    res.status(200).json({ success: true, data: updatedTeam })
  } catch (error) {
    console.error('Invite member error:', error)
    res.status(500).json({ success: false, error: 'Failed to invite member' })
  }
})

// Delete slot
router.delete('/:teamId/slots/:slotId', (req: Request, res: Response) => {
  try {
    const payload = getUserFromToken(req)
    if (!payload) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const team = store.getTeamById(req.params.teamId)
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' })
    }

    if (team.leaderId !== payload.userId) {
      return res.status(403).json({ success: false, error: 'Not your team' })
    }

    const updatedSlots = team.slots.filter(s => s.id !== req.params.slotId)
    const updatedTeam = store.updateTeam(team.id, { slots: updatedSlots })
    
    res.json({ success: true, data: updatedTeam })
  } catch (error) {
    console.error('Delete slot error:', error)
    res.status(500).json({ success: false, error: 'Failed to delete slot' })
  }
})

export default router

