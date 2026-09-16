import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import StudentLayout from '../../components/layout/StudentLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import { SubjectCard } from '../../components/ui/Card'
import { SUBJECTS } from '../../constants/subjects'
import { getQuizRoute } from '../../constants/routes'
import scoresAPI from '../../api/scores.api'
import questionsAPI from '../../api/questions.api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const StudentSubjects = () => {
  const navigate = useNavigate()
  const [subjectStats, setSubjectStats] = useState({})
  const [questionCounts, setQuestionCounts] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scoresRes, questionsRes] = await Promise.all([
          scoresAPI.getSubjectStats(),
          questionsAPI.getSubjectStats()
        ])

        const statsMap = {}
        ;(scoresRes.data.data?.subjects || []).forEach(s => {
          statsMap[s._id || s.subject] = s
        })
        setSubjectStats(statsMap)

        const countMap = {}
        ;(questionsRes.data.data?.subjects || []).forEach(s => {
          countMap[s._id || s.subject] = s.total || s.count || 0
        })
        setQuestionCounts(countMap)
      } catch (error) {
        console.error('Failed to load subjects:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <StudentLayout>
        <div className='flex items-center justify-center min-h-96'>
          <LoadingSpinner size='lg' text='Loading subjects...' />
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <PageWrapper
        title='Choose a Subject'
        subtitle='Select a subject to start practicing exam questions'
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {SUBJECTS.map((subject, i) => {
            const stat = subjectStats[subject.id]
            const qCount = questionCounts[subject.id] || 0

            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <SubjectCard
                  subject={subject.id}
                  onClick={() => navigate(getQuizRoute(subject.id))}
                  stats={{
                    totalQuestions: qCount,
                    avgScore: stat ? Math.round(stat.avgScore || 0) : null,
                    attempts: stat?.totalAttempts || 0
                  }}
                />

                <div className='mt-3 grid grid-cols-3 gap-2 text-center'>
                  <div className='bg-white rounded-xl p-2 border border-gray-100'>
                    <p className='text-base font-bold text-gray-800'>
                      {qCount}
                    </p>
                    <p className='text-xs text-gray-400'>Questions</p>
                  </div>
                  <div className='bg-white rounded-xl p-2 border border-gray-100'>
                    <p className='text-base font-bold text-gray-800'>
                      {stat ? `${Math.round(stat.avgScore || 0)}%` : '-'}
                    </p>
                    <p className='text-xs text-gray-400'>Your Avg</p>
                  </div>
                  <div className='bg-white rounded-xl p-2 border border-gray-100'>
                    <p className='text-base font-bold text-gray-800'>
                      {stat?.totalAttempts || 0}
                    </p>
                    <p className='text-xs text-gray-400'>Attempts</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className='mt-8 p-6 bg-blue-50 border border-blue-100 rounded-3xl'
        >
          <div className='flex items-start gap-4'>
            <span className='text-3xl'>💡</span>
            <div>
              <h3 className='font-bold text-primary-900 mb-1'>Study Tip</h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Focus on subjects where your average score is below 60%.
                Consistent practice of 20 questions per day can significantly
                improve your score. Use the AI study tips for personalized
                recommendations!
              </p>
            </div>
          </div>
        </motion.div>
      </PageWrapper>
    </StudentLayout>
  )
}

export default StudentSubjects
