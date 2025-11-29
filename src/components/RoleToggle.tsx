import type { Role } from '../types'

interface RoleToggleProps {
  value: Role
  onChange: (role: Role) => void
  disabled?: boolean
}

export function RoleToggle({ value, onChange, disabled }: RoleToggleProps) {
  return (
    <div
      style={{
        display: 'flex',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '2px solid #3d3d5c',
      }}
    >
      <button
        type="button"
        onClick={() => !disabled && onChange('leader')}
        disabled={disabled}
        style={{
          flex: 1,
          padding: '12px 24px',
          border: 'none',
          backgroundColor: value === 'leader' ? '#ffd700' : '#2a2a4a',
          color: value === 'leader' ? '#1a1a2e' : '#f5f5f5',
          fontWeight: value === 'leader' ? '700' : '500',
          fontSize: '16px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        👑 Leader
      </button>
      <button
        type="button"
        onClick={() => !disabled && onChange('member')}
        disabled={disabled}
        style={{
          flex: 1,
          padding: '12px 24px',
          border: 'none',
          borderLeft: '2px solid #3d3d5c',
          backgroundColor: value === 'member' ? '#ffd700' : '#2a2a4a',
          color: value === 'member' ? '#1a1a2e' : '#f5f5f5',
          fontWeight: value === 'member' ? '700' : '500',
          fontSize: '16px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        ⚔️ Member
      </button>
    </div>
  )
}

