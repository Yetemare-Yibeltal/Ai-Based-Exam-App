import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import { StatusBadge } from '../ui/Badge'
import { formatTimeAgo } from '../../utils/formatDate'
import { formatPercentage } from '../../utils/formatScore'
import ConfirmDialog from '../ui/ConfirmDialog'
import SearchBar from '../ui/SearchBar'

const UserTable = ({
  users = [],
  type = 'student',
  isLoading = false,
  onBan,
  onUnban,
  onDelete,
  onApprove,
  onView,
  className = ''
}) => {
  const [search, setSearch] = useState('')
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    action: null,
    user: null
  })

  const filtered = users.filter(
    u =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleAction = (action, user) => {
    setConfirmDialog({ isOpen: true, action, user })
  }

  const handleConfirm = async () => {
    const { action, user } = confirmDialog
    setConfirmDialog({ isOpen: false, action: null, user: null })
    if (action === 'ban') await onBan(user.id, 'Violation of terms')
    if (action === 'unban') await onUnban(user.id)
    if (action === 'delete') await onDelete(user.id)
    if (action === 'approve') await onApprove(user.id)
  }

  const getConfirmConfig = () => {
    const { action, user } = confirmDialog
    const configs = {
      ban: {
        title: 'Ban User',
        message: `Are you sure you want to ban ${user?.name}? They will lose access immediately.`,
        confirmText: 'Ban User',
        variant: 'danger'
      },
      unban: {
        title: 'Unban User',
        message: `Are you sure you want to restore ${user?.name}'s access?`,
        confirmText: 'Unban User',
        variant: 'success'
      },
      delete: {
        title: 'Delete User',
        message: `Are you sure you want to delete ${user?.name}? This action cannot be undone.`,
        confirmText: 'Delete User',
        variant: 'danger'
      },
      approve: {
        title: 'Approve Teacher',
        message: `Approve ${user?.name} as a teacher? They will be able to create questions.`,
        confirmText: 'Approve',
        variant: 'primary'
      }
    }
    return configs[action] || configs.ban
  }

  if (isLoading) {
    return (
      <div className='animate-pulse space-y-3'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='h-16 bg-gray-100 rounded-xl' />
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      <div className='mb-4'>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={`Search ${type}s...`}
          className='max-w-sm'
        />
      </div>

      <div className='bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50 border-b border-gray-100'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  User
                </th>
                {type === 'student' && (
                  <>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                      Grade
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                      Avg Score
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                      Quizzes
                    </th>
                  </>
                )}
                {type === 'teacher' && (
                  <>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                      Subject
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                      Questions
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                      Approved
                    </th>
                  </>
                )}
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Joined
                </th>
                <th className='px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-50'>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className='px-6 py-12 text-center text-gray-400'
                  >
                    <div className='text-4xl mb-2'>👤</div>
                    <p className='text-sm'>No {type}s found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((user, i) => (
                  <motion.tr
                    key={user.id || user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className='w-9 h-9 rounded-full object-cover'
                          />
                        ) : (
                          <div className='w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-900 font-bold text-sm'>
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className='font-semibold text-gray-800'>
                            {user.name}
                          </p>
                          <p className='text-xs text-gray-400'>{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {type === 'student' && (
                      <>
                        <td className='px-6 py-4 text-gray-600'>
                          {user.grade}
                        </td>
                        <td className='px-6 py-4 font-semibold text-primary-900'>
                          {formatPercentage(user.averageScore || 0)}
                        </td>
                        <td className='px-6 py-4 text-gray-600'>
                          {user.totalQuizzesTaken || 0}
                        </td>
                      </>
                    )}

                    {type === 'teacher' && (
                      <>
                        <td className='px-6 py-4 capitalize text-gray-600'>
                          {user.subject}
                        </td>
                        <td className='px-6 py-4 text-gray-600'>
                          {user.totalQuestionsCreated || 0}
                        </td>
                        <td className='px-6 py-4 text-gray-600'>
                          {user.totalQuestionsApproved || 0}
                        </td>
                      </>
                    )}

                    <td className='px-6 py-4'>
                      <div className='flex flex-col gap-1'>
                        <StatusBadge
                          status={
                            user.isBanned
                              ? 'banned'
                              : user.isActive
                              ? 'active'
                              : 'inactive'
                          }
                        />
                        {type === 'teacher' &&
                          !user.isApproved &&
                          !user.isBanned && (
                            <span className='text-xs text-yellow-600 font-semibold'>
                              Pending Approval
                            </span>
                          )}
                      </div>
                    </td>

                    <td className='px-6 py-4 text-gray-400 text-xs'>
                      {formatTimeAgo(user.createdAt)}
                    </td>

                    <td className='px-6 py-4'>
                      <div className='flex items-center justify-end gap-1'>
                        {onView && (
                          <Button
                            variant='ghost'
                            size='xs'
                            onClick={() => onView(user)}
                            className='text-blue-600'
                          >
                            View
                          </Button>
                        )}
                        {type === 'teacher' &&
                          !user.isApproved &&
                          !user.isBanned &&
                          onApprove && (
                            <Button
                              variant='ghost'
                              size='xs'
                              onClick={() => handleAction('approve', user)}
                              className='text-green-600'
                            >
                              Approve
                            </Button>
                          )}
                        {!user.isBanned && onBan && (
                          <Button
                            variant='ghost'
                            size='xs'
                            onClick={() => handleAction('ban', user)}
                            className='text-red-600'
                          >
                            Ban
                          </Button>
                        )}
                        {user.isBanned && onUnban && (
                          <Button
                            variant='ghost'
                            size='xs'
                            onClick={() => handleAction('unban', user)}
                            className='text-green-600'
                          >
                            Unban
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant='ghost'
                            size='xs'
                            onClick={() => handleAction('delete', user)}
                            className='text-red-600'
                          >
                            🗑️
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({ isOpen: false, action: null, user: null })
        }
        onConfirm={handleConfirm}
        {...getConfirmConfig()}
      />
    </div>
  )
}

export default UserTable
