import React from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import {
  formatTime,
  getGradeFromPercentage,
  getGradeColor
} from '../../utils/formatScore'

const QuizSummary = ({
  questions = [],
  selectedAnswers = {},
  subject,
  onSubmit,
  onBack,
  isLoading = false
}) => {
  const answered = Object.keys(selectedAnswers).length
  const unanswered = questions.length - answered
  const estimatedScore =
    answered > 0 ? Math.round((answered / questions.length) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className='bg-white rounded-3xl shadow-card border border-gray-100 p-8'
    >
      <div className='text-center mb-8'>
        <div className='text-5xl mb-4'>📋</div>
        <h2 className='text-2xl font-bold text-gray-900'>Quiz Summary</h2>
        <p className='text-gray-500 mt-1 capitalize'>
          {subject?.charAt(0).toUpperCase() + subject?.slice(1)} •{' '}
          {questions.length} Questions
        </p>
      </div>

      <div className='grid grid-cols-3 gap-4 mb-8'>
        <div className='text-center p-4 bg-green-50 rounded-2xl'>
          <p className='text-3xl font-bold text-green-600'>{answered}</p>
          <p className='text-xs text-gray-500 mt-1'>Answered</p>
        </div>
        <div className='text-center p-4 bg-red-50 rounded-2xl'>
          <p className='text-3xl font-bold text-red-500'>{unanswered}</p>
          <p className='text-xs text-gray-500 mt-1'>Unanswered</p>
        </div>
        <div className='text-center p-4 bg-blue-50 rounded-2xl'>
          <p className='text-3xl font-bold text-primary-900'>
            {questions.length}
          </p>
          <p className='text-xs text-gray-500 mt-1'>Total</p>
        </div>
      </div>

      {unanswered > 0 && (
        <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-2xl mb-6'>
          <p className='text-sm text-yellow-800 font-semibold'>
            ⚠️ You have {unanswered} unanswered question(s)
          </p>
          <p className='text-xs text-yellow-700 mt-1'>
            Unanswered questions will be marked as incorrect. You can go back
            and answer them.
          </p>
        </div>
      )}

      <div className='flex flex-col gap-3'>
        <Button
          variant='primary'
          size='lg'
          fullWidth
          onClick={onSubmit}
          isLoading={isLoading}
        >
          ✓ Submit Quiz
        </Button>
        <Button variant='outline' fullWidth onClick={onBack}>
          ← Review Questions
        </Button>
      </div>
    </motion.div>
  )
}

export default QuizSummary
