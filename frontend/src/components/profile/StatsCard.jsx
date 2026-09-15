import React from 'react'
import { motion } from 'framer-motion'
import {
  formatPercentage,
  formatNumber,
  getRankEmoji
} from '../../utils/formatScore'

const StatsCard = ({ user, subjectStats = [], className = '' }) => {
  const stats = [
    {
      icon: '📝',
      label: 'Total Quizzes',
      value: formatNumber(user?.totalQuizzesTaken || 0),
      color: 'bg-blue-50 text-blue-700'
    },
    {
      icon: '📊',
      label: 'Average Score',
      value: formatPercentage(user?.averageScore || 0),
      color: 'bg-green-50 text-green-700'
    },
    {
      icon: '🏆',
      label: 'Best Score',
      value: formatPercentage(user?.bestScore || 0),
      color: 'bg-yellow-50 text-yellow-700'
    },
    {
      icon: '🔥',
      label: 'Study Streak',
      value: `${user?.studyStreak || 0} days`,
      color: 'bg-orange-50 text-orange-700'
    },
    {
      icon: '✅',
      label: 'Correct Answers',
      value: formatNumber(user?.totalCorrectAnswers || 0),
      color: 'bg-emerald-50 text-emerald-700'
    },
    {
      icon: '⭐',
      label: 'Total Questions',
      value: formatNumber(user?.totalQuestionsAnswered || 0),
      color: 'bg-purple-50 text-purple-700'
    }
  ]

  return (
    <div className={className}>
      <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className='bg-white rounded-2xl border border-gray-100 shadow-card p-5'
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${stat.color}`}
            >
              {stat.icon}
            </div>
            <p className='text-2xl font-bold text-gray-900'>{stat.value}</p>
            <p className='text-xs text-gray-500 mt-1 font-medium'>
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default StatsCard
