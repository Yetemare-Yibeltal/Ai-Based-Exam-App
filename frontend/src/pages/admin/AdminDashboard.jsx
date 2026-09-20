import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AdminLayout from '../../components/layout/AdminLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import StatsOverview from '../../components/admin/StatsOverview'
import RecentActivity from '../../components/admin/RecentActivity'
import AnalyticsChart from '../../components/admin/AnalyticsChart'
import SubjectStatsCard from '../../components/admin/SubjectStatsCard'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import useAuthStore from '../../store/useAuthStore'
import adminAPI from '../../api/admin.api'
import questionsAPI from '../../api/questions.api'
import { ROUTES } from '../../constants/routes'

const AdminDashboard = () => {
  const { user } = useAuthStore()
  const [overview, setOverview] = useState(null)
  const [questionStats, setQuestionStats] = useState(null)
  const [activityLog, setActivityLog] = useState([])
  const [growthData, setGrowthData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, qStatsRes, activityRes, growthRes] =
          await Promise.all([
            adminAPI.getOverview(),
            questionsAPI.getAdminQuestionStats(),
            adminAPI.getActivityLog({ limit: 10 }),
            adminAPI.getPlatformGrowth({ period: 'monthly' })
          ])
        setOverview(overviewRes.data.data)
        setQuestionStats(qStatsRes.data.data)
        setActivityLog(activityRes.data.data?.activities || [])
        setGrowthData(growthRes.data.data?.growth || [])
      } catch (error) {
        console.error('Failed to load dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className='flex items-center justify-center min-h-96'>
          <LoadingSpinner size='lg' text='Loading dashboard...' />
        </div>
      </AdminLayout>
    )
  }

  const chartData = growthData.map(d => ({
    label: d.month || d.label || '',
    students: d.students || 0,
    quizzes: d.quizzes || 0
  }))

  const subjectData = questionStats?.bySubject || []

  return (
    <AdminLayout>
      <PageWrapper
        title={`Admin Dashboard 👨‍💼`}
        subtitle={`Welcome back, ${
          user?.name?.split(' ')[0]
        }! Here's what's happening on HEROY.`}
        actions={
          <div className='flex gap-3'>
            <Link to={ROUTES.ADMIN_APPROVE_QUESTIONS}>
              <Button variant='outline' size='sm'>
                ✅ Approve Questions
                {overview?.pendingQuestions > 0 && (
                  <span className='ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5'>
                    {overview.pendingQuestions}
                  </span>
                )}
              </Button>
            </Link>
            <Link to={ROUTES.ADMIN_ANALYTICS}>
              <Button variant='primary' size='sm'>
                📊 Analytics
              </Button>
            </Link>
          </div>
        }
      >
        <StatsOverview
          overview={overview}
          isLoading={isLoading}
          className='mb-8'
        />

        {overview?.pendingQuestions > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-6 flex items-center gap-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-4'
          >
            <span className='text-3xl'>⏳</span>
            <div className='flex-1'>
              <p className='font-bold text-yellow-800'>
                {overview.pendingQuestions} question
                {overview.pendingQuestions !== 1 ? 's' : ''} waiting for
                approval
              </p>
              <p className='text-sm text-yellow-600'>
                Review and approve teacher-submitted questions
              </p>
            </div>
            <Link to={ROUTES.ADMIN_APPROVE_QUESTIONS}>
              <Button variant='warning' size='sm'>
                Review Now
              </Button>
            </Link>
          </motion.div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
          <div className='lg:col-span-2'>
            <AnalyticsChart
              data={chartData}
              type='area'
              title='Platform Growth (Monthly)'
              dataKeys={[
                { key: 'students', name: 'New Students', color: '#1B3A6B' },
                { key: 'quizzes', name: 'Quizzes Taken', color: '#22c55e' }
              ]}
              height={280}
            />
          </div>
          <div>
            <SubjectStatsCard stats={subjectData} />
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <RecentActivity activities={activityLog} />

          <div className='bg-white rounded-2xl border border-gray-100 shadow-card p-6'>
            <h3 className='font-bold text-gray-900 mb-4'>Quick Actions</h3>
            <div className='grid grid-cols-2 gap-3'>
              {[
                {
                  label: '👨‍🎓 Manage Students',
                  path: ROUTES.ADMIN_STUDENTS,
                  color: 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                },
                {
                  label: '👨‍🏫 Manage Teachers',
                  path: ROUTES.ADMIN_TEACHERS,
                  color: 'bg-green-50 text-green-800 hover:bg-green-100'
                },
                {
                  label: '✅ Approve Questions',
                  path: ROUTES.ADMIN_APPROVE_QUESTIONS,
                  color: 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100'
                },
                {
                  label: '❓ All Questions',
                  path: ROUTES.ADMIN_QUESTIONS,
                  color: 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                },
                {
                  label: '📊 Analytics',
                  path: ROUTES.ADMIN_ANALYTICS,
                  color: 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                },
                {
                  label: '📄 Reports',
                  path: ROUTES.ADMIN_REPORTS,
                  color: 'bg-red-50 text-red-800 hover:bg-red-100'
                },
                {
                  label: '🔔 Notifications',
                  path: ROUTES.ADMIN_NOTIFICATIONS,
                  color: 'bg-orange-50 text-orange-800 hover:bg-orange-100'
                },
                {
                  label: '⚙️ Settings',
                  path: ROUTES.ADMIN_SETTINGS,
                  color: 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                }
              ].map((action, i) => (
                <Link key={i} to={action.path}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-semibold text-left transition-all border border-transparent ${action.color}`}
                  >
                    {action.label}
                  </motion.button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </PageWrapper>
    </AdminLayout>
  )
}

export default AdminDashboard
