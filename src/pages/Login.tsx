import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login({ email, password })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
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
        maxWidth: '400px',
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
          🎮 Team Matcher
        </h1>
        <p style={{
          color: '#a0a0b0',
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          Sign in to find your perfect team
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

          <div style={{ marginBottom: '24px' }}>
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
              placeholder="••••••••"
            />
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{
          color: '#a0a0b0',
          textAlign: 'center',
          marginTop: '24px',
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#ffd700', textDecoration: 'none', fontWeight: '600' }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

