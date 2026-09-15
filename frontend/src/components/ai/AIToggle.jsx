import React from 'react'
import { motion } from 'framer-motion'

const AIToggle = ({
  enabled,
  onChange,
  label = 'AI Assistance',
  description = null,
  disabled = false,
  className = ''
}) => (
  <div className={`flex items-center justify-between gap-4 ${className}`}>
    <div>
      <p className='text-sm font-semibold text-gray-800 flex items-center gap-2'>
        <span>🤖</span> {label}
      </p>
      {description && (
        <p className='text-xs text-gray-500 mt-0.5'>{description}</p>
      )}
    </div>
    <button
      type='button'
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        enabled ? 'bg-purple-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <motion.span
        layout
        className='pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform'
        animate={{ x: enabled ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  </div>
)

export default AIToggle
