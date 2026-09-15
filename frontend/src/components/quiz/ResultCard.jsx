import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import { GradeBadge } from '../ui/Badge'
import {
  formatTime,
  getPerformanceLevel,
  getScoreColor
} from '../../utils/formatScore'
import { ROUTES } from '../../constants/routes'

const ResultCard = ({
  score,
  subject,
  onRetry = null,
  onViewDetails = null,
  className = ''
}) => {
  if (!score) return null

  const performance = getPerformanceLevel(score.percentage)
  const scoreColor = getScoreColor(score.percentage)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className='bg-gradient-to-r from-primary-900 to-blue-700 px-8 py-10 text-white text-center'>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className='text-7xl font-black mb-2'
          style={{ color: scoreColor === '#1B3A6B' ? '#ffffff' : scoreColor }}
        >
          {score.percentage}%
        </motion.div>
        <GradeBadge grade={score.grade} />
        <p className='mt-2 text-white text-opacity-80 capitalize text-lg font-semibold'>
          {subject?.charAt(0).toUpperCase() + subject?.slice(1)} Quiz
        </p>
      </div>

      {/* Stats */}
      <div className='p-8'>
        <div className='grid grid-cols-3 gap-4 mb-8'>
          <div className='text-center'>
            <p className='text-3xl font-bold text-green-600'>
              {score.correctAnswers}
            </p>
            <p className='text-xs text-gray-500 mt-1'>Correct</p>
          </div>
          <div className='text-center'>
            <p className='text-3xl font-bold text-red-500'>
              {score.totalQuestions - score.correctAnswers}
            </p>
            <p className='text-xs text-gray-500 mt-1'>Wrong</p>
          </div>
          <div className='text-center'>
            <p className='text-3xl font-bold text-gray-700'>
              {formatTime(score.timeTaken)}
            </p>
            <p className='text-xs text-gray-500 mt-1'>Time</p>
          </div>
        </div>

        <div
          className={`flex items-center gap-3 p-4 rounded-2xl mb-6 ${performance.bg}`}
        >
          <span className='text-2xl'>
            {score.percentage >= 90
              ? '🌟'
              : score.percentage >= 75
              ? '👍'
              : score.percentage >= 50
              ? '💪'
              : '📚'}
          </span>
          <div>
            <p className={`font-bold text-sm ${performance.color}`}>
              {performance.label}
            </p>
            <p className='text-xs text-gray-500'>
              {score.percentage >= 90
                ? 'Outstanding performance! Keep it up!'
                : score.percentage >= 75
                ? "Great job! A little more practice and you'll be excellent!"
                : score.percentage >= 50
                ? 'Good effort! Review the topics you missed.'
                : "Keep practicing! You'll improve with consistency."}
            </p>
          </div>
        </div>

        {score.aiFeedback && (
          <div className='p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-6'>
            <div className='flex items-center gap-2 mb-2'>
              <span>🤖</span>
              <span className='text-sm font-semibold text-primary-900'>
                AI Feedback
              </span>
            </div>
            <p className='text-sm text-gray-700'>{score.aiFeedback}</p>
          </div>
        )}

        <div className='flex flex-col gap-3'>
          <Link to={ROUTES.STUDENT_SUBJECTS}>
            <Button variant='primary' fullWidth size='lg'>
              Practice Another Subject
            </Button>
          </Link>
          {onRetry && (
            <Button variant='outline' fullWidth onClick={onRetry}>
              Retry This Quiz
            </Button>
          )}
          <Link to={ROUTES.STUDENT_SCORES}>
            <Button variant='ghost' fullWidth>
              View All Scores
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default ResultCard
