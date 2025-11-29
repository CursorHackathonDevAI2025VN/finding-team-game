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
  onDragStart?: (suggestion: MatchSuggestion) => void
  onDragEnd?: () => void
  onDrop?: (suggestion: MatchSuggestion) => void
  isDragging?: boolean
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
  onDragStart,
  onDragEnd,
  onDrop,
  isDragging,
}: CardSlotProps) {
  const [expanded, setExpanded] = useState(true)
  const [isDropOver, setIsDropOver] = useState(false)

  // Limit suggestions to TOP 3
  const topSuggestions = suggestions?.slice(0, 3) || []

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDropOver(true)
  }

  const handleDragLeave = () => {
    setIsDropOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDropOver(false)
    const data = e.dataTransfer.getData('application/json')
    if (data) {
      try {
        const suggestion = JSON.parse(data) as MatchSuggestion
        onDrop?.(suggestion)
      } catch (err) {
        console.error('Failed to parse dropped data:', err)
      }
    }
  }

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
            title="Click to re-fetch suggestions"
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
            {loading ? '🧠 Thinking...' : '🔍 Re-find Match'}
          </button>

          {/* Drop Zone - always visible */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            title="Drop a suggestion here to send invitation"
            style={{
              marginTop: '16px',
              padding: isDropOver ? '24px' : '16px',
              border: isDropOver ? '2px dashed #ffd700' : '2px dashed #3d3d5c',
              borderRadius: '12px',
              backgroundColor: isDropOver ? 'rgba(255, 215, 0, 0.15)' : 'rgba(61, 61, 92, 0.3)',
              textAlign: 'center',
              color: isDropOver ? '#ffd700' : '#a0a0b0',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: isDropOver ? '28px' : '20px', transition: 'font-size 0.2s' }}>📥</span>
            <p style={{ margin: '6px 0 0 0', fontSize: '12px' }}>
              {isDropOver ? 'Release to invite!' : 'Drop suggestion here to invite'}
            </p>
          </div>

          {/* Suggestions */}
          {topSuggestions.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{
                color: '#ffd700',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '12px',
              }}>
                Top Suggestions ({topSuggestions.length}{suggestions && suggestions.length > 3 ? ` of ${suggestions.length}` : ''})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topSuggestions.map((s) => (
                  <div
                    key={s.userId}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(s))
                      onDragStart?.(s)
                    }}
                    onDragEnd={() => onDragEnd?.()}
                    onClick={() => onSelectSuggestion?.(s)}
                    title="Drag to any slot's drop zone to invite, or click to invite directly"
                    style={{
                      backgroundColor: '#1a1a2e',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'grab',
                      border: '1px solid #3d3d5c',
                      transition: 'border-color 0.2s, transform 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#ffd700'
                      e.currentTarget.style.transform = 'scale(1.02)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#3d3d5c'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}>
                      <span style={{ color: '#f5f5f5', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ opacity: 0.5, fontSize: '12px' }}>⋮⋮</span>
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

