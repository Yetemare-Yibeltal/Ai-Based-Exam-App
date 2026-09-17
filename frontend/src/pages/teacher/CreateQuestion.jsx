import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import TeacherLayout from '../../components/layout/TeacherLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import QuestionForm from '../../components/teacher/QuestionForm'
import BackButton from '../../components/ui/BackButton'
import useTeacherStore from '../../store/useTeacherStore'
import { ROUTES } from '../../constants/routes'

const TeacherCreateQuestion = () => {
  const navigate = useNavigate()
  const { createQuestion, isLoading } = useTeacherStore()
  const [created, setCreated] = useState(null)

  const handleSubmit = async formData => {
    const result = await createQuestion(formData)
    if (result.success) {
      setCreated(result.question)
      toast.success('Question created successfully!')
    } else {
      toast.error(result.error || 'Failed to create question')
    }
  }

  if (created) {
    return (
      <TeacherLayout>
        <PageWrapper>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className='max-w-lg mx-auto text-center py-12'
          >
            <div className='text-7xl mb-4'>✅</div>
            <h2 className='text-2xl font-black text-gray-900 mb-2'>
              Question Created!
            </h2>
            <p className='text-gray-500 mb-8'>
              Your question has been saved as a draft. You can submit it for
              admin review when ready.
            </p>
            <div className='flex flex-col gap-3'>
              <button
                onClick={() => navigate(`${ROUTES.TEACHER_MANAGE_QUESTIONS}`)}
                className='btn-primary w-full py-3 rounded-xl font-bold bg-primary-900 text-white hover:bg-primary-800 transition-colors'
              >
                View My Questions
              </button>
              <button
                onClick={() => setCreated(null)}
                className='w-full py-3 rounded-xl font-bold border-2 border-primary-900 text-primary-900 hover:bg-primary-50 transition-colors'
              >
                Create Another Question
              </button>
            </div>
          </motion.div>
        </PageWrapper>
      </TeacherLayout>
    )
  }

  return (
    <TeacherLayout>
      <PageWrapper
        title='Create Question'
        subtitle='Write a new exam question for Ethiopian students'
      >
        <div className='max-w-2xl mx-auto'>
          <BackButton className='mb-6' />

          <div className='bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6'>
            <div className='flex items-start gap-3'>
              <span className='text-xl'>💡</span>
              <div className='text-sm text-blue-800'>
                <p className='font-semibold mb-1'>Writing Good Questions</p>
                <ul className='list-disc list-inside space-y-0.5 text-blue-700'>
                  <li>Make the question clear and unambiguous</li>
                  <li>Ensure only ONE answer is correct</li>
                  <li>Make wrong options plausible distractors</li>
                  <li>Write a detailed explanation for the correct answer</li>
                  <li>Align with Ethiopian curriculum standards</li>
                </ul>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-2xl border border-gray-100 shadow-card p-6'>
            <QuestionForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              submitLabel='Save as Draft'
            />
          </div>
        </div>
      </PageWrapper>
    </TeacherLayout>
  )
}

export default TeacherCreateQuestion
