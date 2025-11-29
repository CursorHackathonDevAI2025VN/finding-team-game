// Position types (fixed 4 options)
export type Position = 'frontend' | 'backend' | 'design' | 'business'

export const POSITIONS: Position[] = ['frontend', 'backend', 'design', 'business']

export const POSITION_LABELS: Record<Position, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  design: 'Design',
  business: 'Business'
}

// Role types
export type Role = 'leader' | 'member'

// User type
export interface User {
  id: string
  name: string
  email: string
  password?: string // Only for backend, not returned to client
  role: Role
  position: Position
  skills: string[] // Dynamic array of skills
  teamId?: string
  createdAt: string
}

// Slot type (for team formation)
export interface Slot {
  id: string
  position: Position
  skills: string[] // Required skills for this slot
  memberId?: string
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

export interface AuthResponse {
  token: string
  user: Omit<User, 'password'>
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

export interface MatchResponse {
  suggestions: MatchSuggestion[]
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

