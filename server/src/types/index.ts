// Position types (fixed 4 options)
export type Position = 'frontend' | 'backend' | 'design' | 'business'

export const POSITIONS: Position[] = ['frontend', 'backend', 'design', 'business']

// Role types
export type Role = 'leader' | 'member'

// Invitation status
export type InvitationStatus = 'pending' | 'accepted'

// User type
export interface User {
  id: string
  name: string
  email: string
  password: string
  role: Role
  position: Position
  skills: string[]
  description?: string
  teamId?: string
  createdAt: string
}

// Slot type
export interface Slot {
  id: string
  position: Position
  skills: string[]
  memberId?: string
  status?: InvitationStatus
}

// Team type
export interface Team {
  id: string
  name: string
  leaderId: string
  slots: Slot[]
  createdAt: string
}

// Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: Role
  position: Position
  skills: string[]
}

// Match types
export interface MatchRequest {
  position: Position
  skills: string[]
}

export interface MatchSuggestion {
  userId: string
  user: Omit<User, 'password'>
  score: number
  matchedSkills: string[]
  reason: string
}

// JWT Payload
export interface JWTPayload {
  userId: string
  role: Role
}

