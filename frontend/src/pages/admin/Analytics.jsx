import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import StatCard from '../../components/ui/StatCard'
import AnalyticsChart from '../../components/admin/AnalyticsChart'
import SubjectStatsCard from '../../components/admin/SubjectStatsCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import adminAPI from '../../api/admin.api'

const AdminAnalytics = () => {
  const [overview, setOverview] = useState(null)
  const [userAnalytics, setUserAnalytics] = useState(null)
  const [scoreAnalytics, setScoreAnalytics] = useState(null)
  const [questionAnalytics, setQuestionAnalytics] = useState(null)
  const [aiAnalytics, setAIAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, userRes, scoreRes, qRes, aiRes] = await Promise.all(
          [
            adminAPI.getOverview(),
            adminAPI.getUserAnalytics(),
            adminAPI.getScoreAnalytics(),
            adminAPI.getQuestionAnalytics(),
            adminAPI.getAIAnalytics()
          ]
        )
        setOverview(overviewRes.data.data)
        setUserAnalytics(userRes.data.data)
        setScoreAnalytics(scoreRes.data.data)
        setQuestionAnalytics(qRes.data.data)
        setAIAnalytics(aiRes.data.data)
      } catch (error) {
        console.error('Failed to load analytics:', error)
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
          <LoadingSpinner size='lg' text='Loading analytics...' />
        </div>
      </AdminLayout>
    )
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'users', label: '👥 Users' },
    { id: 'questions', label: '❓ Questions' },
    { id: 'performance', label: '📈 Performance' },
    { id: 'ai', label: '🤖 AI Usage' }
  ]

  const registrationData = (userAnalytics?.registrationTrend || []).map(d => ({
    label: `${d._id?.month}/${d._id?.year}`,
    students: d.count || 0
  }))

  const scoreDistData = (scoreAnalytics?.scoreDistribution || []).map(d => ({
    label: `${d._id}%+`,
    count: d.count || 0
  }))

  const aiUsageData = (aiAnalytics?.monthlyTrend || []).map(d => ({
    label: `${d._id?.month}/${d._id?.year}`,
    generations: d.totalGenerations || 0,
    cost: parseFloat((d.totalCost || 0).toFixed(4))
  }))

  return (
    <AdminLayout>
      <PageWrapper
        title='Analytics'
        subtitle='Platform performance and usage statistics'
      >
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8'>
          <StatCard
            icon='👨‍🎓'
            label='Total Students'
            value={overview?.totalStudents?.toLocaleString() || 0}
            color='blue'
            delay={0}
          />
          <StatCard
            icon='📝'
            label='Total Quizzes'
            value={overview?.totalQuizzesTaken?.toLocaleString() || 0}
            color='green'
            delay={0.1}
          />
          <StatCard
            icon='❓'
            label='Total Questions'
            value={overview?.totalQuestions?.toLocaleString() || 0}
            color='purple'
            delay={0.2}
          />
          <StatCard
            icon='📊'
            label='Avg Score'
            value={`${overview?.averageScore || 0}%`}
            color='orange'
            delay={0.3}
          />
        </div>

        <div className='flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <AnalyticsChart
              data={registrationData}
              type='area'
              title='Student Registrations (Monthly)'
              dataKeys={[
                { key: 'students', name: 'New Students', color: '#1B3A6B' }
              ]}
            />
            <SubjectStatsCard stats={questionAnalytics?.bySubject || []} />
          </div>
        )}

        {activeTab === 'users' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <AnalyticsChart
              data={registrationData}
              type='area'
              title='Registration Trend'
              dataKeys={[
                { key: 'students', name: 'Students', color: '#1B3A6B' }
              ]}
            />
            <div className='bg-white rounded-2xl border border-gray-100 shadow-card p-6'>
              <h3 className='font-bold text-gray-900 mb-4'>
                User Distribution
              </h3>
              <div className='flex flex-col gap-3'>
                {[
                  {
                    label: 'Grade 12 Students',
                    value:
                      userAnalytics?.gradeBreakdown?.find(
                        g => g._id === 'Grade 12'
                      )?.count || 0,
                    color: 'bg-blue-500'
                  },
                  {
                    label: 'Grade 11 Students',
                    value:
                      userAnalytics?.gradeBreakdown?.find(
                        g => g._id === 'Grade 11'
                      )?.count || 0,
                    color: 'bg-indigo-500'
                  },
                  {
                    label: 'Active Teachers',
                    value: overview?.totalTeachers || 0,
                    color: 'bg-green-500'
                  },
                  {
                    label: 'Verified Emails',
                    value: userAnalytics?.summary?.verified || 0,
                    color: 'bg-emerald-500'
                  }
                ].map((item, i) => (
                  <div key={i} className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className='text-sm text-gray-600'>
                        {item.label}
                      </span>
                    </div>
                    <span className='font-bold text-gray-900'>
                      {item.value?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <SubjectStatsCard stats={questionAnalytics?.bySubject || []} />
            <div className='bg-white rounded-2xl border border-gray-100 shadow-card p-6'>
              <h3 className='font-bold text-gray-900 mb-4'>Question Status</h3>
              <div className='flex flex-col gap-4'>
                {[
                  {
                    label: 'Approved',
                    value: questionAnalytics?.summary?.approved || 0,
                    color: 'bg-green-500',
                    pct:
                      questionAnalytics?.summary?.total > 0
                        ? Math.round(
                            (questionAnalytics.summary.approved /
                              questionAnalytics.summary.total) *
                              100
                          )
                        : 0
                  },
                  {
                    label: 'Pending',
                    value: questionAnalytics?.summary?.pending || 0,
                    color: 'bg-yellow-500',
                    pct:
                      questionAnalytics?.summary?.total > 0
                        ? Math.round(
                            (questionAnalytics.summary.pending /
                              questionAnalytics.summary.total) *
                              100
                          )
                        : 0
                  },
                  {
                    label: 'Rejected',
                    value: questionAnalytics?.summary?.rejected || 0,
                    color: 'bg-red-500',
                    pct:
                      questionAnalytics?.summary?.total > 0
                        ? Math.round(
                            (questionAnalytics.summary.rejected /
                              questionAnalytics.summary.total) *
                              100
                          )
                        : 0
                  },
                  {
                    label: 'AI Generated',
                    value: questionAnalytics?.summary?.aiGenerated || 0,
                    color: 'bg-purple-500',
                    pct:
                      questionAnalytics?.summary?.total > 0
                        ? Math.round(
                            (questionAnalytics.summary.aiGenerated /
                              questionAnalytics.summary.total) *
                              100
                          )
                        : 0
                  }
                ].map((item, i) => (
                  <div key={i}>
                    <div className='flex justify-between text-sm mb-1'>
                      <span className='text-gray-600'>{item.label}</span>
                      <span className='font-bold text-gray-900'>
                        {item.value} ({item.pct}%)
                      </span>
                    </div>
                    <div className='w-full h-2 bg-gray-100 rounded-full'>
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <AnalyticsChart
              data={scoreDistData}
              type='bar'
              title='Score Distribution'
              dataKeys={[{ key: 'count', name: 'Students', color: '#1B3A6B' }]}
            />
            <div className='bg-white rounded-2xl border border-gray-100 shadow-card p-6'>
              <h3 className='font-bold text-gray-900 mb-4'>
                Performance Stats
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                {[
                  {
                    label: 'Total Quizzes',
                    value: scoreAnalytics?.overallStats?.totalQuizzes || 0
                  },
                  {
                    label: 'Average Score',
                    value: `${Math.round(
                      scoreAnalytics?.overallStats?.avgScore || 0
                    )}%`
                  },
                  {
                    label: 'Perfect Scores',
                    value: scoreAnalytics?.overallStats?.perfectScores || 0
                  },
                  {
                    label: 'Pass Rate',
                    value: `${Math.round(
                      scoreAnalytics?.overallStats?.passRate || 0
                    )}%`
                  },
                  {
                    label: 'Total Correct',
                    value: (
                      scoreAnalytics?.overallStats?.totalCorrect || 0
                    ).toLocaleString()
                  },
                  {
                    label: 'Accuracy',
                    value: `${Math.round(
                      scoreAnalytics?.overallStats?.accuracy || 0
                    )}%`
                  }
                ].map((stat, i) => (
                  <div
                    key={i}
                    className='text-center p-3 bg-gray-50 rounded-xl'
                  >
                    <p className='text-xl font-black text-gray-900'>
                      {stat.value}
                    </p>
                    <p className='text-xs text-gray-500 mt-0.5'>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <AnalyticsChart
              data={aiUsageData}
              type='area'
              title='AI Generations (Monthly)'
              dataKeys={[
                { key: 'generations', name: 'Generations', color: '#7c3aed' }
              ]}
            />
            <div className='bg-white rounded-2xl border border-gray-100 shadow-card p-6'>
              <h3 className='font-bold text-gray-900 mb-4'>AI Usage Summary</h3>
              <div className='flex flex-col gap-3'>
                {[
                  {
                    label: 'Total Generations',
                    value: aiAnalytics?.platform?.totalGenerations || 0
                  },
                  {
                    label: 'Questions Generated',
                    value: aiAnalytics?.platform?.totalQuestionsGenerated || 0
                  },
                  {
                    label: 'Success Rate',
                    value: `${Math.round(
                      aiAnalytics?.platform?.successRate || 0
                    )}%`
                  },
                  {
                    label: 'Total Cost',
                    value: `$${(aiAnalytics?.platform?.totalCost || 0).toFixed(
                      4
                    )}`
                  },
                  {
                    label: 'Total Tokens',
                    value: (
                      aiAnalytics?.platform?.totalTokens || 0
                    ).toLocaleString()
                  }
                ].map((stat, i) => (
                  <div
                    key={i}
                    className='flex items-center justify-between py-2 border-b border-gray-50 last:border-0'
                  >
                    <span className='text-sm text-gray-600'>{stat.label}</span>
                    <span className='font-bold text-gray-900'>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </PageWrapper>
    </AdminLayout>
  )
}

export default AdminAnalytics
