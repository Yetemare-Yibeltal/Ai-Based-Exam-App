import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/layout/AdminLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Pagination from '../../components/ui/Pagination'
import { formatTimeAgo } from '../../utils/formatDate'
import useNotificationStore from '../../store/useNotificationStore'
import adminAPI from '../../api/admin.api'

const AdminNotifications = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
    loadMore,
    hasMore
  } = useNotificationStore()

  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [announcement, setAnnouncement] = useState({
    title: '',
    message: '',
    targetRole: 'all',
    priority: 'normal'
  })
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    fetchNotifications(1)
  }, [])

  const handleSendAnnouncement = async e => {
    e.preventDefault()
    if (!announcement.title || !announcement.message) {
      toast.error('Title and message are required')
      return
    }
    setIsSending(true)
    try {
      await adminAPI.sendAnnouncement(announcement)
      toast.success('Announcement sent successfully!')
      setAnnouncement({
        title: '',
        message: '',
        targetRole: 'all',
        priority: 'normal'
      })
      setShowAnnouncementForm(false)
    } catch (error) {
      toast.error('Failed to send announcement')
    } finally {
      setIsSending(false)
    }
  }

  const priorityColors = {
    urgent: 'border-l-red-500 bg-red-50',
    high: 'border-l-orange-500 bg-orange-50',
    normal: 'border-l-blue-500 bg-blue-50',
    low: 'border-l-gray-300 bg-gray-50'
  }

  return (
    <AdminLayout>
      <PageWrapper
        title='Notifications'
        subtitle={`${unreadCount} unread notification${
          unreadCount !== 1 ? 's' : ''
        }`}
        actions={
          <div className='flex gap-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
            >
              📢 Send Announcement
            </Button>
            {unreadCount > 0 && (
              <Button variant='ghost' size='sm' onClick={markAllAsRead}>
                ✓ Mark All Read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant='ghost'
                size='sm'
                onClick={deleteAll}
                className='text-red-500'
              >
                🗑️ Clear All
              </Button>
            )}
          </div>
        }
      >
        {/* Announcement Form */}
        {showAnnouncementForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white rounded-2xl border border-gray-100 shadow-card p-6 mb-6'
          >
            <h3 className='font-bold text-gray-900 mb-4'>
              📢 Send Platform Announcement
            </h3>
            <form
              onSubmit={handleSendAnnouncement}
              className='flex flex-col gap-4'
            >
              <input
                value={announcement.title}
                onChange={e =>
                  setAnnouncement(p => ({ ...p, title: e.target.value }))
                }
                placeholder='Announcement title...'
                className='input'
                required
              />
              <textarea
                value={announcement.message}
                onChange={e =>
                  setAnnouncement(p => ({ ...p, message: e.target.value }))
                }
                placeholder='Announcement message...'
                rows={3}
                className='input resize-none'
                required
              />
              <div className='grid grid-cols-2 gap-3'>
                <select
                  value={announcement.targetRole}
                  onChange={e =>
                    setAnnouncement(p => ({ ...p, targetRole: e.target.value }))
                  }
                  className='input'
                >
                  <option value='all'>All Users</option>
                  <option value='student'>Students Only</option>
                  <option value='teacher'>Teachers Only</option>
                </select>
                <select
                  value={announcement.priority}
                  onChange={e =>
                    setAnnouncement(p => ({ ...p, priority: e.target.value }))
                  }
                  className='input'
                >
                  <option value='normal'>Normal Priority</option>
                  <option value='high'>High Priority</option>
                  <option value='urgent'>Urgent</option>
                </select>
              </div>
              <div className='flex gap-3'>
                <Button
                  type='button'
                  variant='ghost'
                  fullWidth
                  onClick={() => setShowAnnouncementForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant='primary'
                  fullWidth
                  isLoading={isSending}
                >
                  Send Announcement
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Notifications List */}
        {isLoading && notifications.length === 0 ? (
          <div className='flex items-center justify-center py-12'>
            <LoadingSpinner size='lg' text='Loading notifications...' />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon='🔔'
            title='No notifications'
            message='You have no notifications right now'
          />
        ) : (
          <div className='flex flex-col gap-3'>
            {notifications.map((notification, i) => (
              <motion.div
                key={notification.id || notification._id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-start gap-4 p-4 rounded-2xl border-l-4 transition-colors ${
                  !notification.isRead
                    ? priorityColors[notification.priority] ||
                      priorityColors.normal
                    : 'bg-white border-l-gray-200'
                }`}
              >
                <div className='text-2xl flex-shrink-0'>
                  {notification.type === 'announcement'
                    ? '📢'
                    : notification.type === 'quiz_completed'
                    ? '📝'
                    : notification.type === 'welcome'
                    ? '🎉'
                    : notification.type === 'question_approved'
                    ? '✅'
                    : notification.type === 'question_rejected'
                    ? '❌'
                    : '🔔'}
                </div>
                <div className='flex-1 min-w-0'>
                  <p
                    className={`text-sm font-semibold ${
                      !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    {notification.title}
                  </p>
                  <p className='text-xs text-gray-500 mt-0.5 leading-relaxed'>
                    {notification.message}
                  </p>
                  <p className='text-xs text-gray-400 mt-1'>
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>
                <div className='flex items-center gap-1 flex-shrink-0'>
                  {!notification.isRead && (
                    <button
                      onClick={() =>
                        markAsRead(notification.id || notification._id)
                      }
                      className='text-xs text-blue-600 hover:underline font-medium'
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() =>
                      deleteNotification(notification.id || notification._id)
                    }
                    className='text-gray-300 hover:text-red-500 transition-colors ml-2'
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ))}

            {hasMore && (
              <div className='text-center pt-4'>
                <Button
                  variant='outline'
                  onClick={loadMore}
                  isLoading={isLoading}
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </PageWrapper>
    </AdminLayout>
  )
}

export default AdminNotifications
