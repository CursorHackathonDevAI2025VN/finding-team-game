import { User, Team } from '../types'

// In-memory data store
class Store {
  private users: Map<string, User> = new Map()
  private teams: Map<string, Team> = new Map()

  // User methods
  createUser(user: User): User {
    this.users.set(user.id, user)
    return user
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id)
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email === email)
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values())
  }

  getUsersByRole(role: 'leader' | 'member'): User[] {
    return Array.from(this.users.values()).filter(u => u.role === role)
  }

  getUsersByPosition(position: string): User[] {
    return Array.from(this.users.values()).filter(u => u.position === position)
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id)
    if (!user) return undefined
    const updated = { ...user, ...updates }
    this.users.set(id, updated)
    return updated
  }

  // Team methods
  createTeam(team: Team): Team {
    this.teams.set(team.id, team)
    return team
  }

  getTeamById(id: string): Team | undefined {
    return this.teams.get(id)
  }

  getTeamByLeaderId(leaderId: string): Team | undefined {
    return Array.from(this.teams.values()).find(t => t.leaderId === leaderId)
  }

  getAllTeams(): Team[] {
    return Array.from(this.teams.values())
  }

  updateTeam(id: string, updates: Partial<Team>): Team | undefined {
    const team = this.teams.get(id)
    if (!team) return undefined
    const updated = { ...team, ...updates }
    this.teams.set(id, updated)
    return updated
  }

  deleteTeam(id: string): boolean {
    return this.teams.delete(id)
  }
}

export const store = new Store()

