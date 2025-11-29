import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { CardSlot } from '../components/CardSlot'
import { matchApi, teamsApi } from '../services/api'
import type { Position, MatchSuggestion, Team } from '../types'

interface SlotState {
  id: string
  position: Position | ''
  skills: string[]
  loading: boolean
  suggestions: MatchSuggestion[]
}

interface Invitation {
  teamId: string
  teamName: string
  slotId: string
  position: Position
  skills: string[]
  leaderId: string
}

export function Home() {
  const { user, isLeader, logout, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [slots, setSlots] = useState<SlotState[]>([])
  const [team, setTeam] = useState<Team | null>(null)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user && isLeader) {
      loadTeam()
    }
  }, [user, isLeader])

  // Check for invitations (for members only)
  const checkInvitations = async () => {
    if (!user || isLeader) return

    try {
      const userInvitations = await teamsApi.getInvitations()
      setInvitations(userInvitations)
      console.log('[Polling] Invitations found:', userInvitations.length)
    } catch (error) {
      console.error('Failed to check invitations:', error)
    }
  }

  // Polling with console.log and invitation checking
  useEffect(() => {
    if (!user) return;

    // Check invitations immediately for members
    if (!isLeader) {
      checkInvitations()
    }

    const pollInterval = setInterval(() => {
      console.log('[Polling] Current state:', {
        timestamp: new Date().toISOString(),
        user: user ? { id: user.id, name: user.name, position: user.position } : null,
        isLeader,
        team: team ? { id: team.id, name: team.name, slotsCount: team.slots.length } : null,
        slots: slots.map(s => ({
          id: s.id,
          position: s.position,
          skillsCount: s.skills.length,
          suggestionsCount: s.suggestions.length,
          loading: s.loading
        })),
        invitationsCount: invitations.length
      })

      // Check for invitations on each poll (for members)
      if (!isLeader) {
        checkInvitations()
      }
    }, 1000)

    return () => clearInterval(pollInterval)
  }, [user, isLeader, team, slots, invitations.length])

  const loadTeam = async () => {
    try {
      const myTeam = await teamsApi.getMyTeam()
      setTeam(myTeam)
      if (myTeam && myTeam.slots.length > 0) {
        setSlots(myTeam.slots.map(s => ({
          id: s.id,
          position: s.position,
          skills: s.skills,
          loading: false,
          suggestions: []
        })))
      }
    } catch (error) {
      console.error('Failed to load team:', error)
    }
  }

  const addSlot = async () => {
    try {
      // For leaders: create slot via backend API
      if (isLeader) {
        // If no team exists, create one first
        let currentTeam = team
        if (!currentTeam) {
          currentTeam = await teamsApi.create('My Team')
          setTeam(currentTeam)
        }

        // Create slot with default values (empty position and skills)
        const updatedTeam = await teamsApi.addSlot(currentTeam.id, 'frontend', [])
        setTeam(updatedTeam)
        
        // Get the newly created slot from the backend
        const newServerSlot = updatedTeam.slots[updatedTeam.slots.length - 1]
        
        // Add to local state
        const newSlot: SlotState = {
          id: newServerSlot.id,
          position: newServerSlot.position,
          skills: newServerSlot.skills,
          loading: false,
          suggestions: []
        }
        setSlots([...slots, newSlot])
      } else {
        // For members: create local slot only (they don't have teams)
        const newSlot: SlotState = {
          id: `local-${Date.now()}`,
          position: '',
          skills: [],
          loading: false,
          suggestions: []
        }
        setSlots([...slots, newSlot])
      }
    } catch (error) {
      console.error('Failed to create slot:', error)
      alert('Failed to create slot. Please try again.')
    }
  }

  const updateSlot = async (slotId: string, updates: Partial<SlotState>) => {
    // Store previous state for potential revert
    const previousSlot = slots.find(s => s.id === slotId)
    if (!previousSlot) return

    // Update local state immediately for better UX
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, ...updates } : s))

    // Only save to backend if:
    // 1. User is a leader
    // 2. Has a team
    // 3. Slot is not a local/temporary slot
    // 4. Update includes position or skills (not just loading state)
    const hasDataUpdate = updates.position !== undefined || updates.skills !== undefined
    
    if (isLeader && team && !slotId.startsWith('local-') && hasDataUpdate) {
      try {
        const updateData: { position?: Position; skills?: string[] } = {}
        if (updates.position) updateData.position = updates.position as Position
        if (updates.skills) updateData.skills = updates.skills

        if (Object.keys(updateData).length > 0) {
          await teamsApi.updateSlot(team.id, slotId, updateData)
        }
      } catch (error) {
        console.error('Failed to update slot:', error)
        // Revert local state on error
        setSlots(prev => prev.map(s => s.id === slotId ? previousSlot : s))
      }
    }
  }

  const deleteSlot = async (slotId: string) => {
    setSlots(prev => prev.filter(s => s.id !== slotId))
    
    if (isLeader && team && !slotId.startsWith('local-')) {
      try {
        await teamsApi.deleteSlot(team.id, slotId)
      } catch (error) {
        console.error('Failed to delete slot:', error)
      }
    }
  }

  const findMatch = async (slotId: string) => {
    const slot = slots.find(s => s.id === slotId)
    if (!slot || !slot.position || slot.skills.length === 0) return

    updateSlot(slotId, { loading: true })

    try {
      const result = await matchApi.getSuggestions(slot.position, slot.skills)
      updateSlot(slotId, { loading: false, suggestions: result.suggestions })
    } catch (error) {
      console.error('Match error:', error)
      updateSlot(slotId, { loading: false })
    }
  }

  const createTeam = async () => {
    try {
      const newTeam = await teamsApi.create('My Team')
      setTeam(newTeam)
    } catch (error) {
      console.error('Failed to create team:', error)
    }
  }

  const handleSelectSuggestion = async (slotId: string, suggestion: MatchSuggestion) => {
    if (!isLeader || !team) {
      alert('Only leaders can invite members')
      return
    }

    try {
      const updatedTeam = await teamsApi.inviteMember(team.id, slotId, suggestion.userId)
      setTeam(updatedTeam)
      
      // Update local slots state to reflect the invitation
      setSlots(prev => prev.map(s => 
        s.id === slotId 
          ? { ...s, suggestions: s.suggestions.filter(sug => sug.userId !== suggestion.userId) }
          : s
      ))
      
      alert(`Successfully invited ${suggestion.user.name}!`)
    } catch (error: any) {
      console.error('Failed to invite member:', error)
      alert(error.message || 'Failed to invite member. Please try again.')
    }
  }

  const handleAcceptInvitation = async (invitation: Invitation) => {
    try {
      // Accept invitation by updating the slot (memberId is already set, just confirm)
      await teamsApi.updateSlot(invitation.teamId, invitation.slotId, {})
      // Remove from invitations list
      setInvitations(prev => prev.filter(inv => 
        !(inv.teamId === invitation.teamId && inv.slotId === invitation.slotId)
      ))
      alert(`You've joined ${invitation.teamName}!`)
    } catch (error) {
      console.error('Failed to accept invitation:', error)
      alert('Failed to accept invitation')
    }
  }

  const handleDeclineInvitation = async (invitation: Invitation) => {
    try {
      // Decline by removing memberId from slot
      await teamsApi.updateSlot(invitation.teamId, invitation.slotId, { memberId: undefined })
      // Remove from invitations list
      setInvitations(prev => prev.filter(inv => 
        !(inv.teamId === invitation.teamId && inv.slotId === invitation.slotId)
      ))
    } catch (error) {
      console.error('Failed to decline invitation:', error)
      alert('Failed to decline invitation')
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.notification-container')) {
        setShowNotificationDropdown(false)
      }
    }

    if (showNotificationDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotificationDropdown])

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a2e',
        color: '#ffd700',
        fontSize: '20px',
      }}>
        Loading...
      </div>
    )
  }

  if (!user) return null

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a2e',
      padding: '20px',
    }}>
      {/* Header */}
      <header style={{
        maxWidth: '1200px',
        margin: '0 auto 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{
            color: '#ffd700',
            fontSize: '28px',
            fontWeight: '700',
            margin: '0 0 4px 0',
          }}>
            {isLeader ? '👑 Build Your Team' : '⚔️ Find a Team'}
          </h1>
          <p style={{ color: '#a0a0b0', margin: 0 }}>
            Welcome, {user.name} ({user.position})
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{
            backgroundColor: isLeader ? '#ffd700' : '#4CAF50',
            color: '#1a1a2e',
            padding: '6px 14px',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            {isLeader ? '👑 Leader' : '⚔️ Member'}
          </span>
          
          {/* Notification Icon */}
          {!isLeader && (
            <div className="notification-container" style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                style={{
                  position: 'relative',
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: '2px solid #ffd700',
                  borderRadius: '8px',
                  color: '#ffd700',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                🔔
                {invitations.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    backgroundColor: '#ff6b6b',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                  }}>
                    {invitations.length > 9 ? '9+' : invitations.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotificationDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '400px',
                  maxHeight: '500px',
                  backgroundColor: '#2a2a4a',
                  borderRadius: '16px',
                  border: '2px solid #ffd700',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  zIndex: 1000,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {/* Dropdown Header */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #3d3d5c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <h3 style={{
                      color: '#ffd700',
                      fontSize: '18px',
                      fontWeight: '700',
                      margin: 0,
                    }}>
                      🔔 Notifications
                    </h3>
                    {invitations.length > 0 && (
                      <span style={{
                        backgroundColor: '#ff6b6b',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}>
                        {invitations.length}
                      </span>
                    )}
                  </div>

                  {/* Invitations List */}
                  <div style={{
                    overflowY: 'auto',
                    maxHeight: '400px',
                  }}>
                    {invitations.length === 0 ? (
                      <div style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: '#a0a0b0',
                      }}>
                        <p style={{ fontSize: '48px', margin: '0 0 12px 0' }}>📭</p>
                        <p style={{ margin: 0 }}>No invitations yet</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                        {invitations.map((invitation) => (
                          <div
                            key={`${invitation.teamId}-${invitation.slotId}`}
                            style={{
                              padding: '16px',
                              backgroundColor: '#1a1a2e',
                              borderRadius: '12px',
                              border: '1px solid #3d3d5c',
                            }}
                          >
                            <div style={{
                              marginBottom: '12px',
                            }}>
                              <h4 style={{
                                color: '#f5f5f5',
                                fontSize: '16px',
                                fontWeight: '600',
                                margin: '0 0 4px 0',
                              }}>
                                {invitation.teamName}
                              </h4>
                              <p style={{
                                color: '#a0a0b0',
                                fontSize: '14px',
                                margin: '4px 0',
                              }}>
                                Position: <strong style={{ color: '#ffd700' }}>{invitation.position}</strong>
                              </p>
                              {invitation.skills.length > 0 && (
                                <div style={{ marginTop: '8px' }}>
                                  <span style={{ color: '#a0a0b0', fontSize: '12px' }}>Required skills: </span>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                                    {invitation.skills.map((skill, idx) => (
                                      <span
                                        key={idx}
                                        style={{
                                          padding: '4px 8px',
                                          backgroundColor: '#3d3d5c',
                                          color: '#ffd700',
                                          borderRadius: '6px',
                                          fontSize: '12px',
                                        }}
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div style={{
                              display: 'flex',
                              gap: '8px',
                            }}>
                              <button
                                onClick={() => handleAcceptInvitation(invitation)}
                                style={{
                                  flex: 1,
                                  padding: '10px 16px',
                                  backgroundColor: '#4CAF50',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
                              >
                                ✅ Accept
                              </button>
                              <button
                                onClick={() => handleDeclineInvitation(invitation)}
                                style={{
                                  flex: 1,
                                  padding: '10px 16px',
                                  backgroundColor: 'transparent',
                                  color: '#ff6b6b',
                                  border: '2px solid #ff6b6b',
                                  borderRadius: '8px',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = '#ff6b6b'
                                  e.currentTarget.style.color = '#fff'
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                  e.currentTarget.style.color = '#ff6b6b'
                                }}
                              >
                                ❌ Decline
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <Link
            to="/profile"
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '2px solid #ffd700',
              borderRadius: '8px',
              color: '#ffd700',
              cursor: 'pointer',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            ⚙️ Profile
          </Link>
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '2px solid #ff6b6b',
              borderRadius: '8px',
              color: '#ff6b6b',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Create Team Button for Leaders without team */}
        {isLeader && !team && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#2a2a4a',
            borderRadius: '16px',
            marginBottom: '24px',
          }}>
            <h2 style={{ color: '#f5f5f5', marginBottom: '16px' }}>
              You don't have a team yet
            </h2>
            <button
              onClick={createTeam}
              style={{
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: '700',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#ffd700',
                color: '#1a1a2e',
                cursor: 'pointer',
              }}
            >
              🎮 Create Team
            </button>
          </div>
        )}

        {/* Slots Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}>
          {slots.map((slot) => (
            <CardSlot
              key={slot.id}
              id={slot.id}
              position={slot.position}
              skills={slot.skills}
              onPositionChange={(position) => updateSlot(slot.id, { position })}
              onSkillsChange={(skills) => updateSlot(slot.id, { skills })}
              onFindMatch={() => findMatch(slot.id)}
              onDelete={() => deleteSlot(slot.id)}
              loading={slot.loading}
              suggestions={slot.suggestions}
              onSelectSuggestion={(suggestion) => handleSelectSuggestion(slot.id, suggestion)}
            />
          ))}
        </div>

        {/* Add Slot Button */}
        {(isLeader ? team : true) && (
          <button
            onClick={addSlot}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              maxWidth: '340px',
              padding: '20px',
              backgroundColor: 'transparent',
              border: '2px dashed #3d3d5c',
              borderRadius: '16px',
              color: '#a0a0b0',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#ffd700'
              e.currentTarget.style.color = '#ffd700'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#3d3d5c'
              e.currentTarget.style.color = '#a0a0b0'
            }}
          >
            ➕ Add Slot Card
          </button>
        )}

        {/* Empty State */}
        {slots.length === 0 && (isLeader ? team : true) && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#a0a0b0',
          }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🃏</p>
            <h2 style={{ color: '#f5f5f5', marginBottom: '8px' }}>
              No slot cards yet
            </h2>
            <p>
              Add a slot card to start finding {isLeader ? 'team members' : 'teams'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

