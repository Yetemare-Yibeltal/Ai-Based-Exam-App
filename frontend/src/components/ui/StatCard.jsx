import React from 'react'
import { motion } from 'framer-motion'

const StatCard = ({
  icon,
  label,
  value,
  subValue = null,
  trend = null,
  color = 'blue',
  className = '',
  delay = 0
}) => {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-700',
      border: 'border-blue-100'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-700',
      border: 'border-green-100'
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-700',
      border: 'border-yellow-100'
    },
    red: { bg: 'bg-red-50', icon: 'text-red-700', border: 'border-red-100' },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-700',
      border: 'border-purple-100'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-700',
      border: 'border-orange-100'
    }
  }

  const c = colors[color] || colors.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${className}`}
    >
      <div className='flex items-start justify-between mb-4'>
        <div
          className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center text-2xl`}
        >
          {icon}
        </div>
        {trend !== null && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              trend >= 0
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className='text-3xl font-bold text-gray-900 mb-1'>{value}</p>
      <p className='text-sm text-gray-500 font-medium'>{label}</p>
      {subValue && <p className='text-xs text-gray-400 mt-1'>{subValue}</p>}
    </motion.div>
  )
}

export default StatCard
