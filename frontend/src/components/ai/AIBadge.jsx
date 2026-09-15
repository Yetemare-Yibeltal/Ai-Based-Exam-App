import React from 'react'

const AIBadge = ({ size = 'sm', className = '' }) => {
  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs gap-1',
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5'
  }

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full
        bg-gradient-to-r from-purple-100 to-indigo-100
        text-purple-700 border border-purple-200
        ${sizes[size] || sizes.sm}
        ${className}
      `}
    >
      <span>🤖</span>
      <span>AI</span>
    </span>
  )
}

export default AIBadge
