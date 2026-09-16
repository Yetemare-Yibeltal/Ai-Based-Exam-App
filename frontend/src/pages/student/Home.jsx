import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import StudentLayout from '../../components/layout/StudentLayout'
import StatCard from '../../components/ui/StatCard'
import ScoreHistory from '../../components/profile/ScoreHistory'
import SubjectProgress from '../../components/profile/SubjectProgress'
import Button from '../../components/ui/Button'
import useAuthStore from '../../store/useAuthStore'
import scoresAPI from '../../api/scores.api'
import { SUBJECTS } from '../../constants/subjects'
import { ROUTES, getQuizRoute } from '../../constants/routes'
import { formatPercentage } from '../../utils/formatScore'

const StudentHome = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [recentScores, setRecentScores] = useState([])
  const [subjectStats, setSubjectStats] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, subjectRes] = await Promise.all([
          scoresAPI.getScoreSummary(),
          scoresAPI.getSubjectStats()
        ])
        setSummary(summaryRes.data.data)
        setRecentScores(summaryRes.data.data?.recentScores || [])
        setSubjectStats(subjectRes.data.data?.subjects || [])
      } catch (error) {
        console.error('Failed to load home data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <StudentLayout>
      <div className='p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto'>
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8'
        >
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h1 className='text-2xl sm:text-3xl font-black text-gray-900'>
                {greeting()}, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className='text-gray-500 mt-1'>
                {user?.grade} • Ready to practice today?
              </p>
            </div>
            {user?.studyStreak > 0 && (
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className='flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-2 rounded-2xl'
              >
                <span className='text-2xl'>🔥</span>
                <div>
                  <p className='text-lg font-black text-orange-600'>
                    {user.studyStreak}
                  </p>
                  <p className='text-xs text-orange-500 font-medium'>
                    day streak
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {!user?.isEmailVerified && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='mt-4 flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3'
            >
              <span className='text-xl'>⚠️</span>
              <div className='flex-1'>
                <p className='text-sm font-semibold text-yellow-800'>
                  Please verify your email address
                </p>
                <p className='text-xs text-yellow-600'>
                  Some features may be limited until your email is verified
                </p>
              </div>
              <Link to='/verify-email'>
                <Button variant='warning' size='sm'>
                  Verify Now
                </Button>
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Row */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8'>
          <StatCard
            icon='📝'
            label='Total Quizzes'
            value={user?.totalQuizzesTaken || 0}
            color='blue'
            delay={0}
          />
          <StatCard
            icon='📊'
            label='Average Score'
            value={formatPercentage(user?.averageScore || 0)}
            color='green'
            delay={0.1}
          />
          <StatCard
            icon='🏆'
            label='Best Score'
            value={formatPercentage(user?.bestScore || 0)}
            color='yellow'
            delay={0.2}
          />
          <StatCard
            icon='✅'
            label='Correct Answers'
            value={user?.totalCorrectAnswers?.toLocaleString() || 0}
            color='purple'
            delay={0.3}
          />
        </div>

        {/* Quick Practice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='mb-8'
        >
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-bold text-gray-900'>Quick Practice</h2>
            <Link
              to={ROUTES.STUDENT_SUBJECTS}
              className='text-sm text-primary-900 font-semibold hover:underline'
            >
              All Subjects →
            </Link>
          </div>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3'>
            {SUBJECTS.map((subject, i) => {
              const stat = subjectStats.find(
                s => (s._id || s.subject) === subject.id
              )
              return (
                <motion.button
                  key={subject.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(getQuizRoute(subject.id))}
                  className={`bg-gradient-to-br ${subject.gradient} rounded-2xl p-4 text-white text-center shadow-md`}
                >
                  <div className='text-3xl mb-2'>{subject.icon}</div>
                  <p className='text-xs font-bold leading-tight'>
                    {subject.nameEn}
                  </p>
                  {stat && (
                    <p className='text-white text-opacity-80 text-xs mt-1'>
                      {Math.round(stat.avgScore || 0)}% avg
                    </p>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Bottom Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <ScoreHistory scores={recentScores} limit={5} />
          <SubjectProgress subjectStats={subjectStats} />
        </div>

        {/* AI Tips CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className='mt-6 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-3xl p-6 text-white'
        >
          <div className='flex items-center justify-between gap-4'>
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-2xl'>🤖</span>
                <h3 className='text-lg font-bold'>Get AI Study Tips</h3>
              </div>
              <p className='text-white text-opacity-80 text-sm'>
                Get personalized study recommendations powered by AI based on
                your performance.
              </p>
            </div>
            <Link to={ROUTES.STUDENT_STUDY_TIPS} className='flex-shrink-0'>
              <Button
                variant='white'
                size='md'
                className='text-purple-700 font-bold whitespace-nowrap'
              >
                Get Tips →
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </StudentLayout>
  )
}

export default StudentHome
