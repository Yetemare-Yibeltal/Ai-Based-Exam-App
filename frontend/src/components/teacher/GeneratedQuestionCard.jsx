import React from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import DifficultyBadge from '../quiz/DifficultyBadge'
import { getSubjectBgClass } from '../../utils/subjectColors'
import { getSubjectIcon } from '../../constants/subjects'

const GeneratedQuestionCard = ({
  question,
  index,
  onAccept,
  onEdit,
  onDiscard,
  isSubmitting = false,
  className = ''
}) => {
  const labels = ['A', 'B', 'C', 'D']

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white rounded-2xl border-2 border-purple-100 shadow-card overflow-hidden ${className}`}
    >
      <div className='bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-xl'>{getSubjectIcon(question.subject)}</span>
          <span className='text-white font-semibold text-sm capitalize'>
            {question.subject}
          </span>
          <span className='bg-white bg-opacity-25 text-white text-xs px-2 py-0.5 rounded-full'>
            🤖 AI Generated
          </span>
        </div>
        <DifficultyBadge difficulty={question.difficulty} size='xs' />
      </div>

      <div className='p-5'>
        <div className='mb-4'>
          <p className='text-sm font-semibold text-gray-900 leading-relaxed mb-1'>
            {question.questionText}
          </p>
          {question.topic && (
            <p className='text-xs text-gray-400'>📌 {question.topic}</p>
          )}
        </div>

        <div className='flex flex-col gap-2 mb-4'>
          {question.options?.map((opt, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                i === question.correctAnswer
                  ? 'bg-green-50 border-2 border-green-400 text-green-800 font-semibold'
                  : 'bg-gray-50 border border-gray-200 text-gray-600'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
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
          <div className='p-3 bg-indigo-50 rounded-xl border border-indigo-100 mb-4'>
            <p className='text-xs font-semibold text-indigo-800 mb-1'>
              💡 AI Explanation
            </p>
            <p className='text-xs text-gray-700 leading-relaxed'>
              {question.explanation}
            </p>
          </div>
        )}

        {question.hints && question.hints.length > 0 && (
          <div className='p-3 bg-yellow-50 rounded-xl border border-yellow-100 mb-4'>
            <p className='text-xs font-semibold text-yellow-800 mb-1'>
              🔍 Hints
            </p>
            <ul className='list-disc list-inside space-y-0.5'>
              {question.hints.map((hint, i) => (
                <li key={i} className='text-xs text-yellow-700'>
                  {hint}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className='flex gap-2'>
          <Button
            variant='primary'
            size='sm'
            fullWidth
            onClick={() => onAccept(question)}
            isLoading={isSubmitting}
          >
            ✅ Accept & Save
          </Button>
          {onEdit && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => onEdit(question)}
            >
              ✏️
            </Button>
          )}
          {onDiscard && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onDiscard(question)}
              className='text-red-500'
            >
              🗑️
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default GeneratedQuestionCard
