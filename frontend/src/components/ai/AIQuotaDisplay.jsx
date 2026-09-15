import React from 'react'
import { motion } from 'framer-motion'

const AIQuotaDisplay = ({ used = 0, limit = 100, className = '' }) => {
  const remaining = limit - used
  const percentage = Math.min((used / limit) * 100, 100)

  const getColor = () => {
    if (percentage >= 90)
      return { bar: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50' }
    if (percentage >= 70)
      return {
        bar: 'bg-yellow-500',
        text: 'text-yellow-600',
        bg: 'bg-yellow-50'
      }
    return { bar: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50' }
  }

  const colors = getColor()

  return (
    <div
      className={`p-4 rounded-2xl border border-gray-100 bg-white ${className}`}
    >
      <div className='flex items-center justify-between mb-2'>
        <span className='text-sm font-semibold text-gray-700 flex items-center gap-1.5'>
          🤖 AI Usage
        </span>
        <span className={`text-sm font-bold ${colors.text}`}>
          {used}/{limit}
        </span>
      </div>
      <div className='w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2'>
        <motion.div
          className={`h-full rounded-full ${colors.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
      <p className='text-xs text-gray-500'>
        {remaining > 0
          ? `${remaining} generation${
              remaining !== 1 ? 's' : ''
            } remaining this month`
          : '⚠️ Monthly limit reached. Resets next month.'}
      </p>
    </div>
  )
}

export default AIQuotaDisplay
