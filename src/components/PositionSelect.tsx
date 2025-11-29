import { POSITIONS, POSITION_LABELS } from '../types'
import type { Position } from '../types'

interface PositionSelectProps {
  value: Position | ''
  onChange: (position: Position) => void
  disabled?: boolean
}

export function PositionSelect({ value, onChange, disabled }: PositionSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Position)}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '12px 16px',
        fontSize: '16px',
        border: '2px solid #3d3d5c',
        borderRadius: '8px',
        backgroundColor: '#2a2a4a',
        color: '#f5f5f5',
        cursor: disabled ? 'not-allowed' : 'pointer',
        outline: 'none',
        transition: 'border-color 0.2s',
      }}
      onFocus={(e) => e.target.style.borderColor = '#ffd700'}
      onBlur={(e) => e.target.style.borderColor = '#3d3d5c'}
    >
      <option value="">Select Position</option>
      {POSITIONS.map(pos => (
        <option key={pos} value={pos}>
          {POSITION_LABELS[pos]}
        </option>
      ))}
    </select>
  )
}

