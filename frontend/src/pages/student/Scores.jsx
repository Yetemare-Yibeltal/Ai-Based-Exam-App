import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import StudentLayout from '../../components/layout/StudentLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import ScoreChart from '../../components/quiz/ScoreChart'
import SubjectFilter from '../../components/quiz/SubjectFilter'
import { GradeBadge } from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import scoresAPI from '../../api/scores.api'
import { formatTimeAgo, formatTime } from '../../utils/formatDate'
import { getSubjectIcon, getSubjectName } from '../../constants/subjects'
import { getSubjectHexColor } from '../../utils/subjectColors'
import { getResultsRoute } from '../../constants/routes'
import usePagination from '../../hooks/usePagination'

const StudentScores = () => {
  const navigate = useNavigate()
  const [scores, setScores] = useState([])
  const [summary, setSummary] = useState(null)
  const [progressData, setProgressData] = useState([])
  const [subjectFilter, setSubjectFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const pagination = usePagination({ initialLimit: 10 })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scoresRes, summaryRes] = await Promise.all([
          scoresAPI.getMyScores({
            page: pagination.page,
            limit: pagination.limit,
            subject: subjectFilter || undefined
          }),
          scoresAPI.getScoreSummary()
        ])

        setScores(scoresRes.data.data || [])
        pagination.updateTotal(scoresRes.data.pagination?.total || 0)
        setSummary(summaryRes.data.data)
      } catch (error) {
        console.error('Failed to load scores:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [pagination.page, subjectFilter])

  useEffect(() => {
    if (subjectFilter) {
      const fetchProgress = async () => {
        try {
          const res = await scoresAPI.getScoreProgress(subjectFilter)
          setProgressData(res.data.data?.progress || [])
        } catch (error) {
          console.error('Failed to load progress:', error)
        }
      }
      fetchProgress()
    } else {
      setProgressData([])
    }
  }, [subjectFilter])

  const handleSubjectChange = subject => {
    setSubjectFilter(subject)
    pagination.goToPage(1)
  }

  if (isLoading) {
    return (
      <StudentLayout>
        <div className='flex items-center justify-center min-h-96'>
          <LoadingSpinner size='lg' text='Loading scores...' />
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <PageWrapper
        title='My Scores'
        subtitle='Track your quiz performance across all subjects'
      >
        {/* Summary Stats */}
        {summary && (
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8'>
            {[
              {
                icon: '📝',
                label: 'Total Quizzes',
                value: summary.totalQuizzes || 0
              },
              {
                icon: '📊',
                label: 'Average Score',
                value: `${Math.round(summary.averageScore || 0)}%`
              },
              {
                icon: '🏆',
                label: 'Best Score',
                value: `${summary.bestScore || 0}%`
              },
              {
                icon: '✅',
                label: 'Pass Rate',
                value: `${summary.passRate || 0}%`
              }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className='bg-white rounded-2xl border border-gray-100 shadow-card p-5 text-center'
              >
                <span className='text-3xl block mb-2'>{stat.icon}</span>
                <p className='text-2xl font-black text-gray-900'>
                  {stat.value}
                </p>
                <p className='text-xs text-gray-500 mt-1'>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Progress Chart */}
        {progressData.length > 0 && (
          <div className='bg-white rounded-2xl border border-gray-100 shadow-card p-6 mb-6'>
            <h3 className='text-base font-bold text-gray-900 mb-4'>
              {getSubjectName(subjectFilter)} Progress
            </h3>
            <ScoreChart
              data={progressData}
              subject={subjectFilter}
              type='area'
              height={200}
            />
          </div>
        )}

        {/* Subject Filter */}
        <div className='mb-6'>
          <SubjectFilter
            selected={subjectFilter}
            onChange={handleSubjectChange}
            showAll
          />
        </div>

        {/* Scores List */}
        {scores.length === 0 ? (
          <EmptyState
            icon='📝'
            title='No scores yet'
            message='Complete a quiz to see your scores here'
            action={() => navigate('/student/subjects')}
            actionLabel='Start Practicing'
          />
        ) : (
          <>
            <div className='flex flex-col gap-3 mb-6'>
              {scores.map((score, i) => {
                const color = getSubjectHexColor(score.subject)
                return (
                  <motion.div
                    key={score.id || score._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() =>
                      navigate(getResultsRoute(score.id || score._id))
                    }
                    className='bg-white rounded-2xl border border-gray-100 shadow-card p-5 cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200'
                  >
                    <div className='flex items-center gap-4'>
                      <div
                        className='w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0'
                        style={{ backgroundColor: `${color}20` }}
                      >
                        {getSubjectIcon(score.subject)}
                      </div>

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1 flex-wrap'>
                          <p className='font-bold text-gray-800 capitalize'>
                            {getSubjectName(score.subject)}
                          </p>
                          <GradeBadge grade={score.grade} />
                          {score.isPerfectScore && (
                            <span className='text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold'>
                              🌟 Perfect!
                            </span>
                          )}
                        </div>
                        <p className='text-xs text-gray-400'>
                          {score.correctAnswers}/{score.totalQuestions} correct
                          • {formatTime(score.timeTaken || 0)} •{' '}
                          {formatTimeAgo(score.createdAt)}
                        </p>
                      </div>

                      <div className='text-right flex-shrink-0'>
                        <p className='text-2xl font-black' style={{ color }}>
                          {score.percentage}%
                        </p>
                        <p className='text-xs text-gray-400 capitalize'>
                          {score.difficulty || 'mixed'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={pagination.goToPage}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              startItem={pagination.startItem}
              endItem={pagination.endItem}
              totalItems={pagination.totalItems}
              getPageNumbers={pagination.getPageNumbers}
            />
          </>
        )}
      </PageWrapper>
    </StudentLayout>
  )
}

export default StudentScores
