import { useState } from 'react'
import type { KeyboardEvent } from 'react'

interface SkillTagInputProps {
  skills: string[]
  onChange: (skills: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export function SkillTagInput({ skills, onChange, placeholder = 'Type skill and press Enter', disabled }: SkillTagInputProps) {
  const [input, setInput] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      const newSkill = input.trim()
      if (!skills.includes(newSkill)) {
        onChange([...skills, newSkill])
      }
      setInput('')
    } else if (e.key === 'Backspace' && !input && skills.length > 0) {
      onChange(skills.slice(0, -1))
    }
  }

  const removeSkill = (skillToRemove: string) => {
    onChange(skills.filter(s => s !== skillToRemove))
  }

  return (
    <div
      style={{
        border: '2px solid #3d3d5c',
        borderRadius: '8px',
        padding: '8px 12px',
        backgroundColor: '#2a2a4a',
        minHeight: '48px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
        cursor: disabled ? 'not-allowed' : 'text',
      }}
    >
      {skills.map(skill => (
        <span
          key={skill}
          style={{
            backgroundColor: '#ffd700',
            color: '#1a1a2e',
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {skill}
          {!disabled && (
            <button
              onClick={() => removeSkill(skill)}
              style={{
                background: 'none',
                border: 'none',
                color: '#1a1a2e',
                cursor: 'pointer',
                padding: '0',
                fontSize: '16px',
                lineHeight: '1',
                opacity: 0.7,
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              ×
            </button>
          )}
        </span>
      ))}
      {!disabled && (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={skills.length === 0 ? placeholder : ''}
          style={{
            flex: 1,
            minWidth: '120px',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: '#f5f5f5',
            fontSize: '14px',
            padding: '4px 0',
          }}
        />
      )}
    </div>
  )
}

