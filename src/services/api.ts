import axios from 'axios'
import type { 
  User, 
  Team, 
  AuthResponse, 
  ApiResponse, 
  MatchResponse,
  RegisterRequest,
  LoginRequest,
  Position,
  InvitationStatus
} from '../types'

// Types for team members response
export interface TeamMemberInfo {
  id: string
  name: string
  position: Position
  skills: string[]
  description?: string
  role: 'leader' | 'member'
}

export interface SlotWithMember {
  id: string
  position: Position
  skills: string[]
  status?: InvitationStatus
  member: TeamMemberInfo | null
}

export interface TeamMembersResponse {
  id: string
  name: string
  leader: TeamMemberInfo | null
  slots: SlotWithMember[]
  createdAt: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data)
    if (res.data.success && res.data.data) {
      localStorage.setItem('token', res.data.data.token)
      return res.data.data
    }
    throw new Error(res.data.error || 'Registration failed')
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data)
    if (res.data.success && res.data.data) {
      localStorage.setItem('token', res.data.data.token)
      return res.data.data
    }
    throw new Error(res.data.error || 'Login failed')
  },

  getMe: async (): Promise<Omit<User, 'password'>> => {
    const res = await api.get<ApiResponse<Omit<User, 'password'>>>('/auth/me')
    if (res.data.success && res.data.data) {
      return res.data.data
    }
    throw new Error(res.data.error || 'Failed to get user')
  },

  logout: () => {
    localStorage.removeItem('token')
  }
}

// Users API
export const usersApi = {
  getAll: async (filters?: { role?: string; position?: string }): Promise<Omit<User, 'password'>[]> => {
    const params = new URLSearchParams()
    if (filters?.role) params.append('role', filters.role)
    if (filters?.position) params.append('position', filters.position)
    
    const res = await api.get<ApiResponse<Omit<User, 'password'>[]>>(`/users?${params}`)
    if (res.data.success && res.data.data) {
      return res.data.data
    }
    throw new Error(res.data.error || 'Failed to get users')
  },

  getById: async (id: string): Promise<Omit<User, 'password'>> => {
    const res = await api.get<ApiResponse<Omit<User, 'password'>>>(`/users/${id}`)
    if (res.data.success && res.data.data) {
      return res.data.data
    }
    throw new Error(res.data.error || 'Failed to get user')
  },

  update: async (id: string, data: { name?: string; position?: Position; skills?: string[]; description?: string }): Promise<Omit<User, 'password'>> => {
    const res = await api.put<ApiResponse<Omit<User, 'password'>>>(`/users/${id}`, data)
    if (res.data.success && res.data.data) {
      return res.data.data
    }
    throw new Error(res.data.error || 'Failed to update user')
  }
}

// Teams API
export const teamsApi = {
  getAll: async (): Promise<Team[]> => {
    const res = await api.get<ApiResponse<Team[]>>('/teams')
    if (res.data.success && res.data.data) {
      return res.data.data
    }
    throw new Error(res.data.error || 'Failed to get teams')
  },

  getMyTeam: async (): Promise<Team | null> => {
    const res = await api.get<ApiResponse<Team | null>>('/teams/my/team')
    if (res.data.success) {
      return res.data.data || null
    }
    throw new Error(res.data.error || 'Failed to get team')
  },

  create: async (name: string): Promise<Team> => {
    const res = await api.post<ApiResponse<Team>>('/teams', { name })
    if (res.data.success && res.data.data) {
      return res.data.data
    }
    throw new Error(res.data.error || 'Failed to create team')
  },

  addSlot: async (teamId: string, position: Position, skills: string[]): Promise<Team> => {
    const res = await api.post<ApiResponse<Team>>(`/teams/${teamId}/slots`, { 
      position, 
      skills: skills || [] 
    })
    if (res.data.success && res.data.data) {
      return res.data.data
    }
    throw new Error(res.data.error || 'Failed to add slot')
  },

  updateSlot: async (teamId: string, slotId: string, data: { position?: Position; skills?: string[]; memberId?: string }): Promise<Team> => {
    const res = await api.put<ApiResponse<Team>>(`/teams/${teamId}/slots/${slotId}`, data)
    if (res.data.success && res.data.data) {
      return res.data.data
    }
    throw new Error(res.data.error || 'Failed to update slot')
  },

  inviteMember: async (teamId: string, slotId: string, memberId: string): Promise<Team> => {
    const res = await api.post<ApiResponse<Team>>(`/teams/${teamId}/slots/${slotId}/invite`, { memberId })
    if (res.data.success && res.data.data) {
      return res.data.data
    }
    throw new Error(res.data.error || 'Failed to invite member')
  },

  deleteSlot: async (teamId: string, slotId: string): Promise<Team> => {
    const res = await api.delete<ApiResponse<Team>>(`/teams/${teamId}/slots/${slotId}`)
    if (res.data.success && res.data.data) {
      return res.data.data
    }
    throw new Error(res.data.error || 'Failed to delete slot')
  },

  getInvitations: async (): Promise<Array<{
    teamId: string
    teamName: string
    slotId: string
    position: Position
    skills: string[]
    leaderId: string
    status: InvitationStatus
  }>> => {
    const res = await api.get<ApiResponse<Array<{
      teamId: string
      teamName: string
      slotId: string
      position: Position
      skills: string[]
      leaderId: string
      status: InvitationStatus
    }>>>('/teams/invitations')
    if (res.data.success && res.data.data) {
      return res.data.data
    }
    throw new Error(res.data.error || 'Failed to get invitations')
  },

  acceptInvitation: async (teamId: string, slotId: string): Promise<Team> => {
    const res = await api.post<ApiResponse<Team>>(`/teams/${teamId}/slots/${slotId}/accept`)
    if (res.data.success && res.data.data) {
      return res.data.data
    }
    throw new Error(res.data.error || 'Failed to accept invitation')
  },

  declineInvitation: async (teamId: string, slotId: string): Promise<Team> => {
    const res = await api.post<ApiResponse<Team>>(`/teams/${teamId}/slots/${slotId}/decline`)
    if (res.data.success && res.data.data) {
      return res.data.data
    }
    throw new Error(res.data.error || 'Failed to decline invitation')
  },

  getTeamMembers: async (teamId: string): Promise<TeamMembersResponse> => {
    const res = await api.get<ApiResponse<TeamMembersResponse>>(`/teams/${teamId}/members`)
    if (res.data.success && res.data.data) {
      return res.data.data
    }
    throw new Error(res.data.error || 'Failed to get team members')
  }
}

// Match API
export const matchApi = {
  getSuggestions: async (position: Position, skills: string[]): Promise<MatchResponse> => {
    const res = await api.post<ApiResponse<MatchResponse>>('/match', { position, skills })
    if (res.data.success && res.data.data) {
      return res.data.data
    }
    throw new Error(res.data.error || 'Failed to get suggestions')
  }
}

