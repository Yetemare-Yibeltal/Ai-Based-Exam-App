import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import TeacherLayout from '../../components/layout/TeacherLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import StatCard from '../../components/ui/StatCard'
import AIQuotaDisplay from '../../components/ai/AIQuotaDisplay'
import Button from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import useAuthStore from '../../store/useAuthStore'
import teacherAPI from '../../api/teacher.api'
import questionsAPI from '../../api/questions.api'
import { formatTimeAgo } from '../../utils/formatDate'
import { getSubjectIcon } from '../../constants/subjects'
import { ROUTES } from '../../constants/routes'

const TeacherDashboard = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [recentQuestions, setRecentQuestions] = useState([])
  const [aiUsage, setAiUsage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, questionsRes, aiRes] = await Promise.all([
          teacherAPI.getAnalyticsOverview(),
          questionsAPI.getTeacherQuestions({
            limit: 5,
            sortBy: 'createdAt',
            sortOrder: 'desc'
          }),
          teacherAPI.getAIUsage()
        ])
        setAnalytics(analyticsRes.data.data)
        setRecentQuestions(questionsRes.data.data || [])
        setAiUsage(aiRes.data.data)
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
      <TeacherLayout>
        <div className='flex items-center justify-center min-h-96'>
          <LoadingSpinner size='lg' text='Loading dashboard...' />
        </div>
      </TeacherLayout>
    )
  }

  return (
    <TeacherLayout>
      <PageWrapper
        title={`Welcome, ${user?.name?.split(' ')[0]}! 👨‍🏫`}
        subtitle={`${
          user?.subject?.charAt(0).toUpperCase() + user?.subject?.slice(1)
        } Teacher`}
        actions={
          <div className='flex gap-3'>
            <Link to={ROUTES.TEACHER_CREATE_QUESTION}>
              <Button variant='outline' size='sm'>
                ✍️ Create Question
              </Button>
            </Link>
            <Link to={ROUTES.TEACHER_AI_GENERATE}>
              <Button variant='primary' size='sm'>
                🤖 AI Generate
              </Button>
            </Link>
          </div>
        }
      >
        {!user?.isApproved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-start gap-3'
          >
            <span className='text-2xl'>⏳</span>
            <div>
              <p className='font-bold text-yellow-800'>
                Account Pending Approval
              </p>
              <p className='text-sm text-yellow-700 mt-0.5'>
                Your account is awaiting admin approval. Once approved, you can
                create and submit questions.
              </p>
            </div>
          </motion.div>
        )}

        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8'>
          <StatCard
            icon='❓'
            label='Total Questions'
            value={analytics?.totalQuestions || 0}
            color='blue'
            delay={0}
          />
          <StatCard
            icon='✅'
            label='Approved'
            value={analytics?.approvedQuestions || 0}
            color='green'
            delay={0.1}
          />
          <StatCard
            icon='⏳'
            label='Pending'
            value={analytics?.pendingQuestions || 0}
            color='yellow'
            delay={0.2}
          />
          <StatCard
            icon='🤖'
            label='AI Generated'
            value={analytics?.aiGeneratedQuestions || 0}
            color='purple'
            delay={0.3}
          />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden'>
              <div className='flex items-center justify-between p-6 border-b border-gray-100'>
                <h3 className='font-bold text-gray-900'>Recent Questions</h3>
                <Link
                  to={ROUTES.TEACHER_MANAGE_QUESTIONS}
                  className='text-sm text-primary-900 hover:underline font-semibold'
                >
                  View All →
                </Link>
              </div>
              {recentQuestions.length === 0 ? (
                <div className='p-12 text-center text-gray-400'>
                  <div className='text-4xl mb-2'>❓</div>
                  <p className='text-sm mb-4'>No questions yet</p>
                  <Link to={ROUTES.TEACHER_CREATE_QUESTION}>
                    <Button variant='primary' size='sm'>
                      Create First Question
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className='divide-y divide-gray-50'>
                  {recentQuestions.map((q, i) => (
                    <motion.div
                      key={q.id || q._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className='flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors'
                    >
                      <span className='text-2xl flex-shrink-0'>
                        {getSubjectIcon(q.subject)}
                      </span>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-gray-800 truncate'>
                          {q.questionText}
                        </p>
                        <p className='text-xs text-gray-400'>
                          {formatTimeAgo(q.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={q.status} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className='flex flex-col gap-4'>
            <AIQuotaDisplay
              used={
                aiUsage?.aiGenerationsThisMonth ||
                user?.aiGenerationsThisMonth ||
                0
              }
              limit={100}
            />

            <div className='bg-gradient-to-br from-green-700 to-emerald-600 rounded-2xl p-5 text-white'>
              <h3 className='font-bold mb-1'>Quick Actions</h3>
              <p className='text-white text-opacity-80 text-xs mb-4'>
                Create and manage your exam questions
              </p>
              <div className='flex flex-col gap-2'>
                <Link to={ROUTES.TEACHER_CREATE_QUESTION}>
                  <button className='w-full bg-white bg-opacity-20 hover:bg-opacity-30 py-2.5 rounded-xl text-sm font-semibold transition-all text-left px-4'>
                    ✍️ Create Question Manually
                  </button>
                </Link>
                <Link to={ROUTES.TEACHER_AI_GENERATE}>
                  <button className='w-full bg-white bg-opacity-20 hover:bg-opacity-30 py-2.5 rounded-xl text-sm font-semibold transition-all text-left px-4'>
                    🤖 Generate with AI
                  </button>
                </Link>
                <Link to={ROUTES.TEACHER_MANAGE_QUESTIONS}>
                  <button className='w-full bg-white bg-opacity-20 hover:bg-opacity-30 py-2.5 rounded-xl text-sm font-semibold transition-all text-left px-4'>
                    📋 Manage My Questions
                  </button>
                </Link>
                <Link to={ROUTES.TEACHER_ANALYTICS}>
                  <button className='w-full bg-white bg-opacity-20 hover:bg-opacity-30 py-2.5 rounded-xl text-sm font-semibold transition-all text-left px-4'>
                    📈 View Analytics
                  </button>
                </Link>
              </div>
            </div>

            {analytics?.approvalRate !== undefined && (
              <div className='bg-white rounded-2xl border border-gray-100 shadow-card p-5'>
                <h3 className='font-bold text-gray-900 mb-3'>Approval Rate</h3>
                <div className='text-center'>
                  <p className='text-4xl font-black text-primary-900'>
                    {Math.round(analytics.approvalRate || 0)}%
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>
                    of your questions get approved
                  </p>
                </div>
                <div className='mt-3 w-full h-2 bg-gray-100 rounded-full'>
                  <div
                    className='h-full bg-green-500 rounded-full transition-all duration-1000'
                    style={{ width: `${analytics.approvalRate || 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
    </TeacherLayout>
  )
}

export default TeacherDashboard
