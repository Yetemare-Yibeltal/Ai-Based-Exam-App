import React from 'react'
import { motion } from 'framer-motion'

const AIStatusBar = ({
  isLoading = false,
  message = '',
  error = null,
  className = ''
}) => {
  if (!isLoading && !message && !error) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
        error
          ? 'bg-red-50 border border-red-200 text-red-700'
          : 'bg-purple-50 border border-purple-200 text-purple-700'
      } ${className}`}
    >
      {isLoading ? (
        <div className='w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin flex-shrink-0' />
      ) : error ? (
        <span>❌</span>
      ) : (
        <span>🤖</span>
      )}
      <span className='flex-1'>{error || message || 'AI is thinking...'}</span>
    </motion.div>
  )
}

export default AIStatusBar
