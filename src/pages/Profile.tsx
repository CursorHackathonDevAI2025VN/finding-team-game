import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { PositionSelect } from '../components/PositionSelect'
import { SkillTagInput } from '../components/SkillTagInput'
import type { Position } from '../types'

export function Profile() {
  const { user, updateUser, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  
  const [name, setName] = useState('')
  const [position, setPosition] = useState<Position | ''>('')
  const [skills, setSkills] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user) {
      setName(user.name)
      setPosition(user.position)
      setSkills(user.skills)
      setDescription(user.description || '')
    }
  }, [user])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!position) {
      setError('Please select a position')
      return
    }

    if (skills.length === 0) {
      setError('Please add at least one skill')
      return
    }

    setSaving(true)

    try {
      await updateUser({ name, position, skills, description: description || undefined })
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a1a2e',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: '#2a2a4a',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        <h1 style={{
          color: '#ffd700',
          fontSize: '28px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '8px',
        }}>
          ⚙️ Edit Profile
        </h1>
        <p style={{
          color: '#a0a0b0',
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          Update your profile information
        </p>

        {error && (
          <div style={{
            backgroundColor: '#ff4444',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#f5f5f5',
              marginBottom: '8px',
              fontWeight: '500',
            }}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #3d3d5c',
                borderRadius: '8px',
                backgroundColor: '#1a1a2e',
                color: '#f5f5f5',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="Your name"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#f5f5f5',
              marginBottom: '8px',
              fontWeight: '500',
            }}>
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #3d3d5c',
                borderRadius: '8px',
                backgroundColor: '#1a1a2e',
                color: '#a0a0b0',
                outline: 'none',
                boxSizing: 'border-box',
                cursor: 'not-allowed',
              }}
            />
            <p style={{ color: '#a0a0b0', fontSize: '12px', marginTop: '4px' }}>
              Email cannot be changed
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#f5f5f5',
              marginBottom: '8px',
              fontWeight: '500',
            }}>
              Role
            </label>
            <div style={{
              padding: '12px 16px',
              fontSize: '16px',
              border: '2px solid #3d3d5c',
              borderRadius: '8px',
              backgroundColor: '#1a1a2e',
              color: '#a0a0b0',
            }}>
              {user.role === 'leader' ? '👑 Leader' : '⚔️ Member'}
            </div>
            <p style={{ color: '#a0a0b0', fontSize: '12px', marginTop: '4px' }}>
              Role cannot be changed
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#f5f5f5',
              marginBottom: '8px',
              fontWeight: '500',
            }}>
              Bio <span style={{ color: '#a0a0b0', fontWeight: '400' }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={150}
              rows={2}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #3d3d5c',
                borderRadius: '8px',
                backgroundColor: '#1a1a2e',
                color: '#f5f5f5',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'none',
              }}
              placeholder="Tell us a bit about yourself..."
            />
            <p style={{ color: '#a0a0b0', fontSize: '12px', marginTop: '4px' }}>
              {description.length}/150 characters
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#f5f5f5',
              marginBottom: '8px',
              fontWeight: '500',
            }}>
              Position
            </label>
            <PositionSelect value={position} onChange={setPosition} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#f5f5f5',
              marginBottom: '8px',
              fontWeight: '500',
            }}>
              Skills
            </label>
            <SkillTagInput 
              skills={skills} 
              onChange={setSkills} 
              placeholder="Type skill and press Enter"
            />
            <p style={{ color: '#a0a0b0', fontSize: '12px', marginTop: '4px' }}>
              Add your skills (e.g., React, Python, Figma)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '16px',
                fontWeight: '700',
                border: '2px solid #3d3d5c',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#f5f5f5',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '16px',
                fontWeight: '700',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#ffd700',
                color: '#1a1a2e',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

