import React from 'react'
import { motion } from 'framer-motion'
import { formatTimeAgo } from '../../utils/formatDate'

const activityIcons = {
  create_question: '✍️',
  approve_question: '✅',
  reject_question: '❌',
  ban_student: '🚫',
  unban_student: '✅',
  ban_teacher: '🚫',
  approve_teacher: '👨‍🏫',
  create_teacher: '➕',
  delete_student: '🗑️',
  send_announcement: '📢',
  clear_cache: '🔄',
  update_settings: '⚙️',
  bulk_approve: '✅',
  bulk_reject: '❌'
}

const activityColors = {
  create_question: 'bg-blue-50 text-blue-700',
  approve_question: 'bg-green-50 text-green-700',
  reject_question: 'bg-red-50 text-red-700',
  ban_student: 'bg-red-50 text-red-700',
  unban_student: 'bg-green-50 text-green-700',
  ban_teacher: 'bg-red-50 text-red-700',
  approve_teacher: 'bg-green-50 text-green-700',
  create_teacher: 'bg-blue-50 text-blue-700',
  default: 'bg-gray-50 text-gray-700'
}

const RecentActivity = ({
  activities = [],
  isLoading = false,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div
        className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${className}`}
      >
        <h3 className='text-base font-bold text-gray-900 mb-4'>
          Recent Activity
        </h3>
        <div className='space-y-3'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex gap-3 animate-pulse'>
              <div className='w-9 h-9 bg-gray-200 rounded-xl flex-shrink-0' />
              <div className='flex-1 space-y-2'>
                <div className='h-3 bg-gray-200 rounded w-3/4' />
                <div className='h-3 bg-gray-100 rounded w-1/2' />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${className}`}
    >
      <h3 className='text-base font-bold text-gray-900 mb-4'>
        Recent Activity
      </h3>
      {!activities || activities.length === 0 ? (
        <div className='text-center py-8 text-gray-400'>
          <div className='text-3xl mb-2'>📋</div>
          <p className='text-sm'>No recent activity</p>
        </div>
      ) : (
        <div className='flex flex-col gap-3'>
          {activities.map((activity, i) => {
            const icon = activityIcons[activity.action] || '📌'
            const colorClass =
              activityColors[activity.action] || activityColors.default

            return (
              <motion.div
                key={activity.id || activity._id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className='flex items-start gap-3'
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}
                >
                  {icon}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm text-gray-800 leading-snug'>
                    {activity.description || `${activity.action} performed`}
                  </p>
                  <p className='text-xs text-gray-400 mt-0.5'>
                    {formatTimeAgo(activity.createdAt)}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default RecentActivity
