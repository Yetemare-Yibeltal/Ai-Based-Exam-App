import React from 'react'
import { motion } from 'framer-motion'

const QuizProgress = ({
  currentIndex,
  totalQuestions,
  answeredIndices = {},
  onGoToQuestion = null,
  className = ''
}) => {
  const answered = Object.keys(answeredIndices).length
  const percentage =
    totalQuestions > 0 ? Math.round((answered / totalQuestions) * 100) : 0

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-card p-4 ${className}`}
    >
      <div className='flex items-center justify-between mb-3'>
        <span className='text-sm font-semibold text-gray-700'>
          Progress: {answered}/{totalQuestions} answered
        </span>
        <span className='text-sm font-bold text-primary-900'>
          {percentage}%
        </span>
      </div>

      <div className='progress-bar mb-4'>
        <motion.div
          className='progress-fill bg-primary-900'
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {totalQuestions <= 30 && (
        <div className='flex flex-wrap gap-1.5'>
          {Array.from({ length: totalQuestions }).map((_, i) => {
            const isAnswered = answeredIndices[i] !== undefined
            const isCurrent = i === currentIndex

            return (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onGoToQuestion && onGoToQuestion(i)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isCurrent
                    ? 'bg-primary-900 text-white ring-2 ring-primary-900 ring-offset-1 scale-110'
                    : isAnswered
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </motion.button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default QuizProgress
