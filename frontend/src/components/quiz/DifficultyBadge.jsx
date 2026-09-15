import React from 'react'

const DifficultyBadge = ({ difficulty, size = 'sm', className = '' }) => {
  const config = {
    easy: {
      label: 'Easy',
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: '🟢'
    },
    medium: {
      label: 'Medium',
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      icon: '🟡'
    },
    hard: { label: 'Hard', bg: 'bg-red-100', text: 'text-red-700', icon: '🔴' }
  }

  const d = config[difficulty] || config.medium
  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${
        d.bg
      } ${d.text} ${sizes[size] || sizes.sm} ${className}`}
    >
      <span>{d.icon}</span>
      <span>{d.label}</span>
    </span>
  )
}

export default DifficultyBadge
