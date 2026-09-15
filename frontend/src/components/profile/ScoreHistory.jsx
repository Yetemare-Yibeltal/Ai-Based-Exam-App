import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { GradeBadge, StatusBadge } from '../ui/Badge'
import { formatTimeAgo, formatTime } from '../../utils/formatDate'
import { getSubjectIcon, getSubjectName } from '../../constants/subjects'
import { getSubjectHexColor } from '../../utils/subjectColors'

const ScoreHistory = ({
  scores = [],
  limit = 10,
  showViewAll = true,
  className = ''
}) => {
  const displayScores = scores.slice(0, limit)

  if (!displayScores || displayScores.length === 0) {
    return (
      <div
        className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${className}`}
      >
        <h3 className='text-lg font-bold text-gray-900 mb-4'>Recent Scores</h3>
        <div className='text-center py-8 text-gray-400'>
          <div className='text-4xl mb-2'>📝</div>
          <p className='text-sm'>No scores yet. Take your first quiz!</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden ${className}`}
    >
      <div className='flex items-center justify-between p-6 border-b border-gray-100'>
        <h3 className='text-lg font-bold text-gray-900'>Recent Scores</h3>
        {showViewAll && (
          <Link
            to='/student/scores'
            className='text-sm text-primary-900 font-semibold hover:underline'
          >
            View All →
          </Link>
        )}
      </div>
      <div className='divide-y divide-gray-50'>
        {displayScores.map((score, i) => {
          const subject = score.subject
          const color = getSubjectHexColor(subject)
          return (
            <motion.div
              key={score.id || score._id || i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className='flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors'
            >
              <div
                className='w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0'
                style={{ backgroundColor: `${color}20` }}
              >
                {getSubjectIcon(subject)}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-gray-800 capitalize'>
                  {getSubjectName(subject)}
                </p>
                <p className='text-xs text-gray-400'>
                  {score.correctAnswers}/{score.totalQuestions} correct •{' '}
                  {formatTimeAgo(score.createdAt)}
                </p>
              </div>
              <div className='text-right flex-shrink-0'>
                <p className='text-lg font-bold' style={{ color }}>
                  {score.percentage}%
                </p>
                <GradeBadge grade={score.grade} />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default ScoreHistory
