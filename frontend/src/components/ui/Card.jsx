import React from 'react'
import { motion } from 'framer-motion'

const Card = ({
  children,
  className = '',
  hover = false,
  onClick = null,
  padding = 'p-6',
  shadow = 'shadow-card',
  border = true,
  rounded = 'rounded-2xl',
  animate = false
}) => {
  const baseClass = `
    bg-white
    ${rounded}
    ${shadow}
    ${border ? 'border border-gray-100' : ''}
    ${padding}
    ${
      hover
        ? 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer'
        : ''
    }
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim()

  if (animate) {
    return (
      <motion.div
        className={baseClass}
        onClick={onClick}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={
          hover ? { y: -4, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } : {}
        }
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={baseClass} onClick={onClick}>
      {children}
    </div>
  )
}

export const StatCard = ({
  icon,
  label,
  value,
  change,
  color = 'primary',
  className = ''
}) => {
  const colors = {
    primary: 'text-primary-900 bg-primary-50',
    success: 'text-green-700 bg-green-50',
    warning: 'text-yellow-700 bg-yellow-50',
    danger: 'text-red-700 bg-red-50',
    purple: 'text-purple-700 bg-purple-50'
  }

  return (
    <Card className={className} animate>
      <div className='flex items-start justify-between'>
        <div className='flex flex-col gap-1'>
          <p className='text-sm text-gray-500 font-medium'>{label}</p>
          <p className='text-3xl font-bold text-gray-900'>{value}</p>
          {change !== undefined && (
            <p
              className={`text-xs font-semibold ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last week
            </p>
          )}
        </div>
        {icon && (
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
              colors[color] || colors.primary
            }`}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}

export const SubjectCard = ({ subject, onClick, stats }) => {
  const subjectConfig = {
    math: {
      icon: '📐',
      color: 'from-blue-900 to-blue-700',
      name: 'Mathematics'
    },
    english: {
      icon: '📚',
      color: 'from-green-800 to-green-600',
      name: 'English'
    },
    biology: {
      icon: '🔬',
      color: 'from-cyan-700 to-teal-600',
      name: 'Biology'
    },
    chemistry: {
      icon: '⚗️',
      color: 'from-orange-700 to-amber-600',
      name: 'Chemistry'
    },
    physics: {
      icon: '⚡',
      color: 'from-purple-800 to-violet-700',
      name: 'Physics'
    },
    civics: { icon: '🏛️', color: 'from-red-800 to-red-700', name: 'Civics' }
  }

  const config = subjectConfig[subject] || {
    icon: '📝',
    color: 'from-gray-700 to-gray-600',
    name: subject
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className='cursor-pointer'
    >
      <div
        className={`bg-gradient-to-br ${config.color} rounded-2xl p-6 text-white shadow-lg`}
      >
        <div className='text-4xl mb-3'>{config.icon}</div>
        <h3 className='text-lg font-bold mb-1'>{config.name}</h3>
        {stats && (
          <div className='mt-3 pt-3 border-t border-white border-opacity-20'>
            <div className='flex justify-between text-sm'>
              <span className='opacity-80'>Questions</span>
              <span className='font-semibold'>{stats.totalQuestions || 0}</span>
            </div>
            {stats.avgScore !== undefined && (
              <div className='flex justify-between text-sm mt-1'>
                <span className='opacity-80'>Your Avg</span>
                <span className='font-semibold'>{stats.avgScore}%</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default Card
