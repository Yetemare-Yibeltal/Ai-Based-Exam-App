import React from 'react'
import { motion } from 'framer-motion'
import { getSubjectIcon, getSubjectName } from '../../constants/subjects'
import { getSubjectHexColor } from '../../utils/subjectColors'

const SubjectStatsCard = ({ stats = [], className = '' }) => {
  if (!stats || stats.length === 0) {
    return (
      <div
        className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${className}`}
      >
        <h3 className='text-base font-bold text-gray-900 mb-4'>
          Questions by Subject
        </h3>
        <div className='text-center py-8 text-gray-400'>
          <div className='text-4xl mb-2'>📚</div>
          <p className='text-sm'>No question data available</p>
        </div>
      </div>
    )
  }

  const maxCount = Math.max(...stats.map(s => s.total || s.count || 0))

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${className}`}
    >
      <h3 className='text-base font-bold text-gray-900 mb-6'>
        Questions by Subject
      </h3>
      <div className='flex flex-col gap-4'>
        {stats.map((stat, i) => {
          const subject = stat._id || stat.subject
          const total = stat.total || stat.count || 0
          const approved = stat.approved || 0
          const pending = stat.pending || 0
          const color = getSubjectHexColor(subject)
          const barWidth = maxCount > 0 ? (total / maxCount) * 100 : 0

          return (
            <motion.div
              key={subject}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-lg'>{getSubjectIcon(subject)}</span>
                  <span className='text-sm font-semibold text-gray-700 capitalize'>
                    {getSubjectName(subject)}
                  </span>
                </div>
                <div className='text-right'>
                  <span className='text-sm font-bold text-gray-900'>
                    {total}
                  </span>
                  <span className='text-xs text-gray-400 ml-1'>total</span>
                </div>
              </div>
              <div className='w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1'>
                <motion.div
                  className='h-full rounded-full'
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08 }}
                />
              </div>
              <div className='flex gap-3 text-xs text-gray-400'>
                <span className='text-green-600 font-medium'>
                  ✅ {approved} approved
                </span>
                <span className='text-yellow-600 font-medium'>
                  ⏳ {pending} pending
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default SubjectStatsCard
