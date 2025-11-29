import type { MatchSuggestion } from '../types'
import { POSITION_LABELS } from '../types'

interface SuggestionCardProps {
  suggestion: MatchSuggestion
  onInvite?: () => void
  onRequestJoin?: () => void
  isLeader?: boolean
}

export function SuggestionCard({ suggestion, onInvite, onRequestJoin, isLeader }: SuggestionCardProps) {
  const { user, score, matchedSkills, reason } = suggestion

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50'
    if (score >= 50) return '#FFC107'
    return '#ff6b6b'
  }

  return (
    <div
      style={{
        backgroundColor: '#2a2a4a',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        border: '2px solid #3d3d5c',
        transition: 'transform 0.2s, box-shadow 0.2s',
        minWidth: '280px',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'
      }}
    >
      {/* Header with score */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
      }}>
        <div>
          <h3 style={{
            color: '#f5f5f5',
            fontSize: '18px',
            fontWeight: '700',
            margin: '0 0 4px 0',
          }}>
            {user.name}
          </h3>
          <span style={{
            backgroundColor: '#3d3d5c',
            color: '#ffd700',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
          }}>
            {POSITION_LABELS[user.position]}
          </span>
        </div>
        <div style={{
          backgroundColor: getScoreColor(score),
          color: score >= 50 ? '#1a1a2e' : '#fff',
          padding: '8px 14px',
          borderRadius: '12px',
          fontWeight: '800',
          fontSize: '18px',
        }}>
          {score}%
        </div>
      </div>

      {/* Description */}
      {user.description && (
        <p style={{
          color: '#a0a0b0',
          fontSize: '13px',
          margin: '0 0 12px 0',
          fontStyle: 'italic',
        }}>
          "{user.description}"
        </p>
      )}

      {/* Skills */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ color: '#a0a0b0', fontSize: '12px', marginBottom: '6px' }}>
          Skills
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {user.skills.map(skill => (
            <span
              key={skill}
              style={{
                backgroundColor: matchedSkills.includes(skill) ? '#ffd700' : '#3d3d5c',
                color: matchedSkills.includes(skill) ? '#1a1a2e' : '#f5f5f5',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: matchedSkills.includes(skill) ? '600' : '400',
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Reason */}
      <p style={{
        color: '#8a8aa0',
        fontSize: '13px',
        marginBottom: '16px',
        lineHeight: '1.4',
      }}>
        {reason}
      </p>

      {/* Action Button */}
      <button
        onClick={isLeader ? onInvite : onRequestJoin}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '14px',
          fontWeight: '700',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: '#ffd700',
          color: '#1a1a2e',
          cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isLeader ? '📨 Invite to Team' : '🤝 Request to Join'}
      </button>
    </div>
  )
}

