import React from 'react'
import { motion } from 'framer-motion'
import Button from './Button'

const EmptyState = ({
  icon = '📭',
  title = 'Nothing here yet',
  message = '',
  action = null,
  actionLabel = '',
  className = ''
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
  >
    <div className='text-6xl mb-4'>{icon}</div>
    <h3 className='text-xl font-bold text-gray-800 mb-2'>{title}</h3>
    {message && <p className='text-gray-500 mb-6 max-w-sm'>{message}</p>}
    {action && actionLabel && (
      <Button onClick={action} variant='primary'>
        {actionLabel}
      </Button>
    )}
  </motion.div>
)

export default EmptyState
