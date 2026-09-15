import React from 'react'
import { motion } from 'framer-motion'
import { formatTimeAgo } from '../../utils/formatDate'
import { getSubjectIcon } from '../../constants/subjects'

const statusColors = {
  success: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700'
}

const typeLabels = {
  generate_question: 'Generated Questions',
  validate_question: 'Validated Question',
  explain_answer: 'Explained Answer',
  study_tips: 'Study Tips',
  weak_subject_analysis: 'Weak Subject Analysis'
}

const AIHistoryPanel = ({ logs = [], isLoading = false, className = '' }) => {
  if (isLoading) {
    return (
      <div
        className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${className}`}
      >
        <h3 className='text-base font-bold text-gray-900 mb-4'>AI History</h3>
        <div className='space-y-3'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='h-14 bg-gray-100 rounded-xl animate-pulse'
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${className}`}
    >
      <h3 className='text-base font-bold text-gray-900 mb-4'>AI History</h3>
      {!logs || logs.length === 0 ? (
        <div className='text-center py-8 text-gray-400'>
          <div className='text-3xl mb-2'>🤖</div>
          <p className='text-sm'>No AI history yet</p>
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          {logs.map((log, i) => (
            <motion.div
              key={log.id || log._id || i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className='flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors'
            >
              <div className='w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-lg flex-shrink-0'>
                {log.subject ? getSubjectIcon(log.subject) : '🤖'}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-800'>
                  {typeLabels[log.type] || log.type}
                </p>
                <p className='text-xs text-gray-400'>
                  {log.subject && `${log.subject} • `}
                  {formatTimeAgo(log.createdAt)}
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  statusColors[log.status] || statusColors.pending
                }`}
              >
                {log.status}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AIHistoryPanel
