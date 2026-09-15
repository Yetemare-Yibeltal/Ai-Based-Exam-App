import React from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import DifficultyBadge from './DifficultyBadge'
import { getSubjectBgClass } from '../../utils/subjectColors'

const AIQuestionPreview = ({
  question,
  index,
  onEdit,
  onDelete,
  onSubmit,
  isSubmitting = false,
  className = ''
}) => {
  if (!question) return null

  const labels = ['A', 'B', 'C', 'D']

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden ${className}`}
    >
      <div
        className={`${getSubjectBgClass(
          question.subject
        )} px-5 py-3 flex items-center justify-between`}
      >
        <div className='flex items-center gap-2'>
          <span className='text-white text-xs font-semibold opacity-80'>
            AI Generated #{index + 1}
          </span>
          <span className='bg-white bg-opacity-20 text-white text-xs px-2 py-0.5 rounded-full'>
            🤖 AI
          </span>
        </div>
        <DifficultyBadge difficulty={question.difficulty} size='xs' />
      </div>

      <div className='p-5'>
        <p className='text-sm font-semibold text-gray-900 mb-4 leading-relaxed'>
          {question.questionText}
        </p>

        <div className='flex flex-col gap-2 mb-4'>
          {question.options?.map((opt, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm ${
                i === question.correctAnswer
                  ? 'bg-green-50 border border-green-300 text-green-800 font-semibold'
                  : 'bg-gray-50 border border-gray-200 text-gray-600'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i === question.correctAnswer
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {i === question.correctAnswer ? '✓' : labels[i]}
              </span>
              {opt}
            </div>
          ))}
        </div>

        {question.explanation && (
          <div className='p-3 bg-blue-50 rounded-xl border border-blue-100 mb-4'>
            <p className='text-xs text-gray-500 font-semibold mb-1'>
              💡 Explanation
            </p>
            <p className='text-xs text-gray-700'>{question.explanation}</p>
          </div>
        )}

        <div className='flex gap-2'>
          {onSubmit && (
            <Button
              variant='primary'
              size='sm'
              onClick={() => onSubmit(question)}
              isLoading={isSubmitting}
              className='flex-1'
            >
              Submit for Review
            </Button>
          )}
          {onEdit && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => onEdit(question)}
            >
              ✏️ Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant='danger'
              size='sm'
              onClick={() => onDelete(question)}
            >
              🗑️
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default AIQuestionPreview
