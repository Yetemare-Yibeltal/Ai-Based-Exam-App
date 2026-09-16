import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import StudentLayout from '../../components/layout/StudentLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import LeaderboardTable from '../../components/profile/LeaderboardTable'
import SubjectFilter from '../../components/quiz/SubjectFilter'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import leaderboardAPI from '../../api/leaderboard.api'
import useAuthStore from '../../store/useAuthStore'

const StudentLeaderboard = () => {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('global')
  const [subjectFilter, setSubjectFilter] = useState('math')
  const [leaderboards, setLeaderboards] = useState({
    global: [],
    weekly: [],
    monthly: [],
    subject: []
  })
  const [myRank, setMyRank] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [globalRes, weeklyRes, monthlyRes, rankRes] = await Promise.all([
          leaderboardAPI.getStudentGlobal({ limit: 20 }),
          leaderboardAPI.getStudentWeekly({ limit: 20 }),
          leaderboardAPI.getStudentMonthly({ limit: 20 }),
          leaderboardAPI.getStudentMyRank()
        ])

        setLeaderboards(prev => ({
          ...prev,
          global: globalRes.data.data?.leaderboard || [],
          weekly: weeklyRes.data.data?.leaderboard || [],
          monthly: monthlyRes.data.data?.leaderboard || []
        }))
        setMyRank(rankRes.data.data)
      } catch (error) {
        console.error('Failed to load leaderboard:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchSubjectLeaderboard = async () => {
      try {
        const res = await leaderboardAPI.getStudentBySubject(subjectFilter, {
          limit: 20
        })
        setLeaderboards(prev => ({
          ...prev,
          subject: res.data.data?.leaderboard || []
        }))
      } catch (error) {
        console.error('Failed to load subject leaderboard:', error)
      }
    }
    if (subjectFilter) fetchSubjectLeaderboard()
  }, [subjectFilter])

  const tabs = [
    { id: 'global', label: '🌍 Global' },
    { id: 'weekly', label: '📅 This Week' },
    { id: 'monthly', label: '🗓️ This Month' },
    { id: 'subject', label: '📚 By Subject' }
  ]

  return (
    <StudentLayout>
      <PageWrapper
        title='Leaderboard'
        subtitle='See how you rank among Ethiopian students'
      >
        {/* My Rank Card */}
        {myRank?.globalRank?.hasRank && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-gradient-to-r from-primary-900 to-blue-700 rounded-3xl p-6 text-white mb-8'
          >
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-white text-opacity-80 text-sm mb-1'>
                  Your Global Rank
                </p>
                <div className='flex items-center gap-3'>
                  <span className='text-5xl font-black'>
                    #{myRank.globalRank.rank}
                  </span>
                  <div>
                    <p className='text-sm font-semibold'>
                      Top {myRank.globalRank.topPercentile}% of all students
                    </p>
                    <p className='text-white text-opacity-70 text-xs'>
                      Out of {myRank.globalRank.totalStudents?.toLocaleString()}{' '}
                      students
                    </p>
                  </div>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-white text-opacity-70 text-xs mb-1'>
                  Average Score
                </p>
                <p className='text-3xl font-black'>
                  {myRank.globalRank.avgScore}%
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {!myRank?.globalRank?.hasRank && (
          <div className='bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 text-sm text-blue-800'>
            <span className='font-semibold'>📊 Complete at least one quiz</span>{' '}
            to get your rank on the leaderboard!
          </div>
        )}

        {/* Tabs */}
        <div className='flex gap-2 mb-6 bg-gray-100 p-1 rounded-2xl overflow-x-auto scrollbar-hide'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-primary-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Subject Filter for Subject Tab */}
        {activeTab === 'subject' && (
          <div className='mb-6'>
            <SubjectFilter
              selected={subjectFilter}
              onChange={setSubjectFilter}
              showAll={false}
            />
          </div>
        )}

        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <LoadingSpinner size='lg' text='Loading leaderboard...' />
          </div>
        ) : (
          <LeaderboardTable
            entries={leaderboards[activeTab] || []}
            title={
              activeTab === 'global'
                ? 'Global Leaderboard'
                : activeTab === 'weekly'
                ? "This Week's Top Students"
                : activeTab === 'monthly'
                ? "This Month's Top Students"
                : `${
                    subjectFilter?.charAt(0).toUpperCase() +
                    subjectFilter?.slice(1)
                  } Leaderboard`
            }
          />
        )}
      </PageWrapper>
    </StudentLayout>
  )
}

export default StudentLeaderboard
