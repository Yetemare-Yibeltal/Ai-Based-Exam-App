import React from 'react'
import { motion } from 'framer-motion'
import OptionButton from './OptionButton'
import Badge from '../ui/Badge'
import { getSubjectBgClass } from '../../utils/subjectColors'

const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  showResult = false,
  correctAnswer = null,
  disabled = false
}) => {
  if (!question) return null

  const options = question.options || []
  const subject = question.subject
  const difficulty = question.difficulty

  const difficultyConfig = {
    easy: { label: 'Easy', variant: 'success' },
    medium: { label: 'Medium', variant: 'warning' },
    hard: { label: 'Hard', variant: 'danger' }
  }

  const diff = difficultyConfig[difficulty] || difficultyConfig.medium

  return (
    <motion.div
      key={question._id || question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className='bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden'
    >
      {/* Question header */}
      <div className={`${getSubjectBgClass(subject)} px-6 py-4`}>
        <div className='flex items-center justify-between'>
          <span className='text-white text-sm font-semibold opacity-90 capitalize'>
            {subject?.charAt(0).toUpperCase() + subject?.slice(1)}
          </span>
          <div className='flex items-center gap-2'>
            <Badge variant={diff.variant} size='xs'>
              {diff.label}
            </Badge>
            <span className='text-white text-sm font-bold opacity-90'>
              Q{questionNumber}/{totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {/* Question body */}
      <div className='p-6 sm:p-8'>
        <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-6 leading-relaxed'>
          {question.questionText}
        </h3>

        {question.imageUrl && (
          <div className='mb-6 rounded-xl overflow-hidden border border-gray-200'>
            <img
              src={question.imageUrl}
              alt='Question diagram'
              className='w-full object-contain max-h-64'
            />
          </div>
        )}

        <div className='flex flex-col gap-3'>
          {options.map((option, index) => (
            <OptionButton
              key={index}
              index={index}
              text={option}
              isSelected={selectedAnswer === index}
              isCorrect={showResult && correctAnswer === index}
              isWrong={
                showResult &&
                selectedAnswer === index &&
                correctAnswer !== index
              }
              onClick={() => !disabled && !showResult && onSelectAnswer(index)}
              disabled={disabled || showResult}
            />
          ))}
        </div>

        {question.topic && (
          <p className='mt-4 text-xs text-gray-400'>Topic: {question.topic}</p>
        )}
      </div>
    </motion.div>
  )
}

export default QuestionCard
