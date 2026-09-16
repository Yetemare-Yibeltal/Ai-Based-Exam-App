import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import StudentLayout from '../../components/layout/StudentLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import SubjectFilter from '../../components/quiz/SubjectFilter'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import useAI from '../../hooks/useAI'

const StudentStudyTips = () => {
  const {
    studyTips,
    weakSubjects,
    isLoading,
    error,
    getStudyTips,
    getSubjectTips,
    analyzeWeakSubjects,
    getExamTips,
    getTimeManagementTips
  } = useAI()

  const [activeTab, setActiveTab] = useState('personalized')
  const [subjectTips, setSubjectTips] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState('math')
  const [examTips, setExamTips] = useState(null)
  const [timeTips, setTimeTips] = useState(null)
  const [isLoadingSubject, setIsLoadingSubject] = useState(false)

  useEffect(() => {
    if (activeTab === 'personalized' && !studyTips) {
      getStudyTips()
    }
    if (activeTab === 'weak' && !weakSubjects) {
      analyzeWeakSubjects()
    }
    if (activeTab === 'exam' && !examTips) {
      getExamTips().then(res => {
        if (res.success) setExamTips(res.data)
      })
    }
    if (activeTab === 'time' && !timeTips) {
      getTimeManagementTips().then(res => {
        if (res.success) setTimeTips(res.data)
      })
    }
  }, [activeTab])

  const handleSubjectChange = async subject => {
    setSelectedSubject(subject)
    setIsLoadingSubject(true)
    const res = await getSubjectTips(subject)
    if (res.success) setSubjectTips(res.data)
    setIsLoadingSubject(false)
  }

  const tabs = [
    { id: 'personalized', label: '🤖 AI Tips' },
    { id: 'subject', label: '📚 By Subject' },
    { id: 'weak', label: '⚠️ Weak Areas' },
    { id: 'exam', label: '📝 Exam Tips' },
    { id: 'time', label: '⏰ Time Management' }
  ]

  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-green-200 bg-green-50'
  }

  return (
    <StudentLayout>
      <PageWrapper
        title='Study Tips'
        subtitle='AI-powered personalized study recommendations'
      >
        {/* Tabs */}
        <div className='flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-900 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-900 hover:text-primary-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Personalized AI Tips */}
        {activeTab === 'personalized' && (
          <div>
            {isLoading && !studyTips && (
              <div className='flex items-center justify-center py-12'>
                <LoadingSpinner
                  size='lg'
                  text='AI is generating your personalized tips...'
                />
              </div>
            )}

            {error && (
              <div className='text-center py-12'>
                <p className='text-red-500 mb-4'>{error}</p>
                <Button variant='outline' onClick={getStudyTips}>
                  Try Again
                </Button>
              </div>
            )}

            {studyTips && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {studyTips.motivationalMessage && (
                  <div className='bg-gradient-to-r from-primary-900 to-blue-700 rounded-3xl p-6 text-white mb-6'>
                    <div className='flex items-start gap-3'>
                      <span className='text-3xl'>🤖</span>
                      <div>
                        <p className='font-bold text-lg mb-1'>
                          Your AI Coach Says:
                        </p>
                        <p className='text-white text-opacity-90'>
                          {studyTips.motivationalMessage}
                        </p>
                      </div>
                    </div>
                    {studyTips.weeklyGoal && (
                      <div className='mt-4 pt-4 border-t border-white border-opacity-20'>
                        <p className='text-white text-opacity-80 text-sm font-semibold'>
                          🎯 Weekly Goal: {studyTips.weeklyGoal}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className='flex flex-col gap-4'>
                  {(studyTips.tips || []).map((tip, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`rounded-2xl border-2 p-5 ${
                        priorityColors[tip.priority] ||
                        'border-gray-200 bg-white'
                      }`}
                    >
                      <div className='flex items-start gap-3'>
                        <div className='w-8 h-8 bg-white rounded-xl flex items-center justify-center text-sm font-bold text-primary-900 flex-shrink-0 shadow-sm'>
                          {i + 1}
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2 flex-wrap'>
                            <h3 className='font-bold text-gray-900'>
                              {tip.title}
                            </h3>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                tip.priority === 'high'
                                  ? 'bg-red-100 text-red-700'
                                  : tip.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {tip.priority} priority
                            </span>
                            {tip.estimatedTimePerDay && (
                              <span className='text-xs text-gray-500'>
                                ⏱ {tip.estimatedTimePerDay}
                              </span>
                            )}
                          </div>
                          <p className='text-gray-700 text-sm leading-relaxed'>
                            {tip.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className='mt-6 text-center'>
                  <Button
                    variant='outline'
                    onClick={getStudyTips}
                    isLoading={isLoading}
                  >
                    🔄 Generate New Tips
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Subject Tips */}
        {activeTab === 'subject' && (
          <div>
            <div className='mb-6'>
              <SubjectFilter
                selected={selectedSubject}
                onChange={handleSubjectChange}
                showAll={false}
              />
            </div>

            {isLoadingSubject && (
              <div className='flex items-center justify-center py-12'>
                <LoadingSpinner size='lg' text='Loading subject tips...' />
              </div>
            )}

            {subjectTips && !isLoadingSubject && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='flex flex-col gap-4'
              >
                {subjectTips.weeklyStudyPlan && (
                  <div className='bg-blue-50 border border-blue-100 rounded-2xl p-5'>
                    <h3 className='font-bold text-primary-900 mb-2'>
                      📅 Weekly Study Plan
                    </h3>
                    <p className='text-gray-700 text-sm'>
                      {subjectTips.weeklyStudyPlan}
                    </p>
                  </div>
                )}

                {(subjectTips.keyTopics || []).length > 0 && (
                  <div className='bg-white rounded-2xl border border-gray-100 shadow-card p-5'>
                    <h3 className='font-bold text-gray-900 mb-3'>
                      🎯 Key Topics to Focus On
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {subjectTips.keyTopics.map((topic, i) => (
                        <span
                          key={i}
                          className='px-3 py-1 bg-primary-50 text-primary-900 rounded-full text-sm font-medium'
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(subjectTips.tips || []).map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className='bg-white rounded-2xl border border-gray-100 shadow-card p-5'
                  >
                    <div className='flex items-start gap-3'>
                      <span className='text-2xl'>
                        {i === 0
                          ? '💡'
                          : i === 1
                          ? '📖'
                          : i === 2
                          ? '✏️'
                          : i === 3
                          ? '🔍'
                          : '🧠'}
                      </span>
                      <div>
                        <div className='flex items-center gap-2 mb-1'>
                          <h3 className='font-bold text-gray-900 text-sm'>
                            {tip.title}
                          </h3>
                          {tip.timeRequired && (
                            <span className='text-xs text-gray-400'>
                              ⏱ {tip.timeRequired}
                            </span>
                          )}
                        </div>
                        <p className='text-gray-600 text-sm leading-relaxed'>
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Weak Subjects */}
        {activeTab === 'weak' && (
          <div>
            {isLoading && !weakSubjects && (
              <div className='flex items-center justify-center py-12'>
                <LoadingSpinner
                  size='lg'
                  text='Analyzing your performance...'
                />
              </div>
            )}

            {weakSubjects && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='flex flex-col gap-6'
              >
                {!weakSubjects.hasData ? (
                  <EmptyState
                    icon='📊'
                    title='No data yet'
                    message={weakSubjects.message}
                    action={() => (window.location.href = '/student/subjects')}
                    actionLabel='Start Practicing'
                  />
                ) : (
                  <>
                    {weakSubjects.aiAnalysis && (
                      <div className='bg-gradient-to-r from-primary-900 to-blue-700 rounded-3xl p-6 text-white'>
                        <div className='flex items-start gap-3'>
                          <span className='text-3xl'>🤖</span>
                          <div>
                            <p className='font-bold mb-1'>AI Analysis</p>
                            <p className='text-white text-opacity-90 text-sm'>
                              {weakSubjects.aiAnalysis}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {weakSubjects.weakSubjects?.length > 0 && (
                      <div>
                        <h3 className='text-base font-bold text-gray-900 mb-3'>
                          ⚠️ Needs Improvement
                        </h3>
                        <div className='flex flex-col gap-3'>
                          {weakSubjects.weakSubjects.map((s, i) => (
                            <div
                              key={i}
                              className='bg-red-50 border border-red-200 rounded-2xl p-4'
                            >
                              <div className='flex items-center justify-between mb-2'>
                                <span className='font-semibold text-red-800 capitalize'>
                                  {s.subject}
                                </span>
                                <span className='text-red-700 font-bold'>
                                  {Math.round(s.avgScore)}%
                                </span>
                              </div>
                              <div className='w-full h-2 bg-red-200 rounded-full'>
                                <div
                                  className='h-full bg-red-500 rounded-full'
                                  style={{ width: `${s.avgScore}%` }}
                                />
                              </div>
                              <p className='text-xs text-red-600 mt-1'>
                                {s.totalAttempts} attempts •{' '}
                                {Math.round(s.passRate || 0)}% pass rate
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {weakSubjects.recommendations?.length > 0 && (
                      <div>
                        <h3 className='text-base font-bold text-gray-900 mb-3'>
                          💡 Recommendations
                        </h3>
                        <div className='flex flex-col gap-3'>
                          {weakSubjects.recommendations.map((rec, i) => (
                            <div
                              key={i}
                              className='bg-white rounded-2xl border border-gray-100 shadow-card p-5'
                            >
                              <div className='flex items-start gap-3'>
                                <div className='w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-sm font-bold text-primary-900'>
                                  {i + 1}
                                </div>
                                <div>
                                  <p className='font-semibold text-gray-800 capitalize mb-1'>
                                    {rec.subject}
                                  </p>
                                  <p className='text-gray-600 text-sm'>
                                    {rec.tip}
                                  </p>
                                  <p className='text-xs text-primary-900 mt-1'>
                                    ⏱ {rec.weeklyHours}h/week recommended
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Exam Tips */}
        {activeTab === 'exam' && (
          <div>
            {!examTips ? (
              <div className='flex items-center justify-center py-12'>
                <LoadingSpinner size='lg' text='Loading exam tips...' />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='flex flex-col gap-6'
              >
                {examTips.examTips?.before && (
                  <div>
                    <h3 className='text-base font-bold text-gray-900 mb-3'>
                      📅 Before the Exam
                    </h3>
                    <div className='flex flex-col gap-3'>
                      {examTips.examTips.before.map((tip, i) => (
                        <div
                          key={i}
                          className='flex items-start gap-3 bg-white rounded-2xl border border-gray-100 shadow-card p-4'
                        >
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                              tip.priority === 'high'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {tip.priority}
                          </span>
                          <div>
                            <p className='font-semibold text-gray-800 text-sm'>
                              {tip.title}
                            </p>
                            <p className='text-gray-600 text-sm mt-0.5'>
                              {tip.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {examTips.examTips?.during && (
                  <div>
                    <h3 className='text-base font-bold text-gray-900 mb-3'>
                      ✏️ During the Exam
                    </h3>
                    <div className='flex flex-col gap-3'>
                      {examTips.examTips.during.map((tip, i) => (
                        <div
                          key={i}
                          className='flex items-start gap-3 bg-white rounded-2xl border border-gray-100 shadow-card p-4'
                        >
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                              tip.priority === 'high'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {tip.priority}
                          </span>
                          <div>
                            <p className='font-semibold text-gray-800 text-sm'>
                              {tip.title}
                            </p>
                            <p className='text-gray-600 text-sm mt-0.5'>
                              {tip.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {examTips.examTips?.subjectSpecific && (
                  <div>
                    <h3 className='text-base font-bold text-gray-900 mb-3'>
                      📚 Subject-Specific Tips
                    </h3>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                      {Object.entries(examTips.examTips.subjectSpecific).map(
                        ([subject, tip]) => (
                          <div
                            key={subject}
                            className='bg-white rounded-2xl border border-gray-100 shadow-card p-4'
                          >
                            <p className='font-bold text-gray-800 capitalize mb-1'>
                              {subject}
                            </p>
                            <p className='text-gray-600 text-sm'>{tip}</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Time Management */}
        {activeTab === 'time' && (
          <div>
            {!timeTips ? (
              <div className='flex items-center justify-center py-12'>
                <LoadingSpinner
                  size='lg'
                  text='Loading time management tips...'
                />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='flex flex-col gap-6'
              >
                {timeTips.tips?.dailySchedule && (
                  <div className='bg-white rounded-2xl border border-gray-100 shadow-card p-6'>
                    <h3 className='font-bold text-gray-900 mb-2'>
                      📅 Recommended Daily Schedule
                    </h3>
                    <p className='text-sm text-gray-500 mb-4'>
                      {timeTips.tips.dailySchedule.recommendation}
                    </p>
                    <div className='flex flex-col gap-2'>
                      {(timeTips.tips.dailySchedule.sample || []).map(
                        (slot, i) => (
                          <div
                            key={i}
                            className='flex items-center gap-3 p-3 bg-gray-50 rounded-xl'
                          >
                            <span className='text-xs font-bold text-primary-900 w-32 flex-shrink-0'>
                              {slot.time}
                            </span>
                            <span className='text-sm text-gray-700'>
                              {slot.activity}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {timeTips.tips?.techniques && (
                  <div>
                    <h3 className='font-bold text-gray-900 mb-3'>
                      🧠 Study Techniques
                    </h3>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      {timeTips.tips.techniques.map((tech, i) => (
                        <div
                          key={i}
                          className='bg-white rounded-2xl border border-gray-100 shadow-card p-5'
                        >
                          <h4 className='font-bold text-gray-800 mb-1'>
                            {tech.name}
                          </h4>
                          <p className='text-gray-600 text-sm mb-2'>
                            {tech.description}
                          </p>
                          <p className='text-xs text-primary-900 font-semibold'>
                            ✅ {tech.benefit}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {timeTips.tips?.productivityTips && (
                  <div className='bg-blue-50 border border-blue-100 rounded-2xl p-5'>
                    <h3 className='font-bold text-primary-900 mb-3'>
                      💡 Productivity Tips
                    </h3>
                    <ul className='flex flex-col gap-2'>
                      {timeTips.tips.productivityTips.map((tip, i) => (
                        <li
                          key={i}
                          className='flex items-start gap-2 text-sm text-gray-700'
                        >
                          <span className='text-primary-900 mt-0.5'>•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </PageWrapper>
    </StudentLayout>
  )
}

export default StudentStudyTips
