import React from 'react'
import { motion } from 'framer-motion'
import {
  getSubjectHexColor,
  getSubjectBgClass
} from '../../utils/subjectColors'
import { getSubjectIcon, getSubjectName } from '../../constants/subjects'
import { formatPercentage } from '../../utils/formatScore'

const SubjectProgress = ({ subjectStats = [], className = '' }) => {
  if (!subjectStats || subjectStats.length === 0) {
    return (
      <div
        className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${className}`}
      >
        <h3 className='text-lg font-bold text-gray-900 mb-4'>
          Subject Performance
        </h3>
        <div className='text-center py-8 text-gray-400'>
          <div className='text-4xl mb-2'>📊</div>
          <p className='text-sm'>No quiz data yet. Start practicing!</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${className}`}
    >
      <h3 className='text-lg font-bold text-gray-900 mb-6'>
        Subject Performance
      </h3>
      <div className='flex flex-col gap-5'>
        {subjectStats.map((stat, i) => {
          const subject = stat._id || stat.subject
          const avg = stat.avgScore || stat.averageScore || 0
          const attempts = stat.totalAttempts || stat.attempts || 0
          const color = getSubjectHexColor(subject)

          return (
            <motion.div
              key={subject}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-lg'>{getSubjectIcon(subject)}</span>
                  <span className='text-sm font-semibold text-gray-700 capitalize'>
                    {getSubjectName(subject)}
                  </span>
                  <span className='text-xs text-gray-400'>
                    ({attempts} quizzes)
                  </span>
                </div>
                <span className='text-sm font-bold' style={{ color }}>
                  {formatPercentage(avg)}
                </span>
              </div>
              <div className='w-full h-2.5 bg-gray-100 rounded-full overflow-hidden'>
                <motion.div
                  className='h-full rounded-full'
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(avg, 100)}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              </div>
              <div className='flex justify-between mt-1'>
                <span className='text-xs text-gray-400'>0%</span>
                <span className='text-xs text-gray-400'>100%</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default SubjectProgress
