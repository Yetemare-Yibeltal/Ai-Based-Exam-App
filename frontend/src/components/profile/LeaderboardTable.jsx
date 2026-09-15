import React from 'react'
import { motion } from 'framer-motion'
import {
  getRankBadgeClass,
  getRankEmoji,
  formatPercentage
} from '../../utils/formatScore'
import useAuthStore from '../../store/useAuthStore'

const LeaderboardTable = ({
  entries = [],
  title = 'Leaderboard',
  className = ''
}) => {
  const { user } = useAuthStore()

  if (!entries || entries.length === 0) {
    return (
      <div
        className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${className}`}
      >
        <h3 className='text-lg font-bold text-gray-900 mb-4'>{title}</h3>
        <div className='text-center py-8 text-gray-400'>
          <div className='text-4xl mb-2'>🏆</div>
          <p className='text-sm'>No leaderboard data yet</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden ${className}`}
    >
      <div className='p-6 border-b border-gray-100'>
        <h3 className='text-lg font-bold text-gray-900'>{title}</h3>
      </div>
      <div className='divide-y divide-gray-50'>
        {entries.map((entry, i) => {
          const isCurrentUser =
            entry.isCurrentUser ||
            (user && (entry.id === user.id || entry._id === user._id))
          const rank = entry.rank || i + 1

          return (
            <motion.div
              key={entry.id || entry._id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                isCurrentUser
                  ? 'bg-primary-50 border-l-4 border-primary-900'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${getRankBadgeClass(
                  rank
                )}`}
              >
                {rank <= 3 ? getRankEmoji(rank) : rank}
              </div>

              <div className='flex-shrink-0'>
                {entry.avatar ? (
                  <img
                    src={entry.avatar}
                    alt={entry.name}
                    className='w-9 h-9 rounded-full object-cover border-2 border-gray-100'
                  />
                ) : (
                  <div className='w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-900 font-bold text-sm'>
                    {entry.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>

              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <p
                    className={`text-sm font-semibold truncate ${
                      isCurrentUser ? 'text-primary-900' : 'text-gray-800'
                    }`}
                  >
                    {entry.name}
                    {isCurrentUser && (
                      <span className='ml-1 text-xs text-primary-600'>
                        (You)
                      </span>
                    )}
                  </p>
                </div>
                <p className='text-xs text-gray-400 truncate'>
                  {entry.grade && `${entry.grade} • `}
                  {entry.totalAttempts ? `${entry.totalAttempts} quizzes` : ''}
                  {entry.studyStreak
                    ? ` • 🔥 ${entry.studyStreak} day streak`
                    : ''}
                </p>
              </div>

              <div className='text-right flex-shrink-0'>
                <p className='text-base font-bold text-gray-900'>
                  {formatPercentage(entry.avgScore || entry.averageScore)}
                </p>
                <p className='text-xs text-gray-400'>avg score</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default LeaderboardTable
