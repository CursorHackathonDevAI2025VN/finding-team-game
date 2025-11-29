import { useState } from 'react'
import { PositionSelect } from './PositionSelect'
import { SkillTagInput } from './SkillTagInput'
import type { Position, MatchSuggestion } from '../types'

interface CardSlotProps {
  id: string
  position: Position | ''
  skills: string[]
  onPositionChange: (position: Position) => void
  onSkillsChange: (skills: string[]) => void
  onFindMatch: () => void
  onDelete: () => void
  loading?: boolean
  suggestions?: MatchSuggestion[]
  onSelectSuggestion?: (suggestion: MatchSuggestion) => void
}

export function CardSlot({
  position,
  skills,
  onPositionChange,
  onSkillsChange,
  onFindMatch,
  onDelete,
  loading,
  suggestions,
  onSelectSuggestion,
}: CardSlotProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div
      style={{
        backgroundColor: '#2a2a4a',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        border: '2px solid #3d3d5c',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <h3 style={{
          color: '#ffd700',
          fontSize: '18px',
          fontWeight: '700',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          🃏 Slot Card
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              color: '#a0a0b0',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            {expanded ? '▲' : '▼'}
          </button>
          <button
            onClick={onDelete}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff6b6b',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ×
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* Position Select */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: '#f5f5f5',
              marginBottom: '8px',
              fontWeight: '500',
              fontSize: '14px',
            }}>
              Position
            </label>
            <PositionSelect value={position} onChange={onPositionChange} />
          </div>

          {/* Skills Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#f5f5f5',
              marginBottom: '8px',
              fontWeight: '500',
              fontSize: '14px',
            }}>
              Required Skills
            </label>
            <SkillTagInput
              skills={skills}
              onChange={onSkillsChange}
              placeholder="Type skill and press Enter"
            />
          </div>

          {/* Find Match Button */}
          <button
            onClick={onFindMatch}
            disabled={!position || skills.length === 0 || loading}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '700',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: (!position || skills.length === 0) ? '#3d3d5c' : '#ffd700',
              color: (!position || skills.length === 0) ? '#a0a0b0' : '#1a1a2e',
              cursor: (!position || skills.length === 0 || loading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '🔍 Finding...' : '🔍 Find Match'}
          </button>

          {/* Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{
                color: '#ffd700',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '12px',
              }}>
                Suggestions ({suggestions.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {suggestions.map((s) => (
                  <div
                    key={s.userId}
                    onClick={() => onSelectSuggestion?.(s)}
                    style={{
                      backgroundColor: '#1a1a2e',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer',
                      border: '1px solid #3d3d5c',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#ffd700'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#3d3d5c'}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}>
                      <span style={{ color: '#f5f5f5', fontWeight: '600' }}>
                        {s.user.name}
                      </span>
                      <span style={{
                        backgroundColor: s.score >= 80 ? '#4CAF50' : s.score >= 50 ? '#FFC107' : '#ff6b6b',
                        color: s.score >= 50 ? '#1a1a2e' : '#fff',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '700',
                      }}>
                        {s.score}%
                      </span>
                    </div>
                    <div style={{ color: '#a0a0b0', fontSize: '12px', marginBottom: '4px' }}>
                      {s.user.position} • {s.matchedSkills.join(', ')}
                    </div>
                    <div style={{ color: '#8a8aa0', fontSize: '11px' }}>
                      {s.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

