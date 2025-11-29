import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { RoleToggle } from '../components/RoleToggle'
import { PositionSelect } from '../components/PositionSelect'
import { SkillTagInput } from '../components/SkillTagInput'
import type { Role, Position } from '../types'

export function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('member')
  const [position, setPosition] = useState<Position | ''>('')
  const [skills, setSkills] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!position) {
      setError('Please select a position')
      return
    }

    if (skills.length === 0) {
      setError('Please add at least one skill')
      return
    }

    setLoading(true)

    try {
      await register({ name, email, password, role, position, skills })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

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
          🎮 Join the Game
        </h1>
        <p style={{
          color: '#a0a0b0',
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          Create your profile to find teammates
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="your@email.com"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#f5f5f5',
              marginBottom: '8px',
              fontWeight: '500',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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
              placeholder="Min 6 characters"
            />
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
            <RoleToggle value={role} onChange={setRole} />
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

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '700',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#ffd700',
              color: '#1a1a2e',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{
          color: '#a0a0b0',
          textAlign: 'center',
          marginTop: '24px',
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#ffd700', textDecoration: 'none', fontWeight: '600' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

