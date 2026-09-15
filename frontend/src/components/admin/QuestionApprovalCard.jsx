import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import DifficultyBadge from '../quiz/DifficultyBadge'
import { getSubjectBgClass } from '../../utils/subjectColors'
import { getSubjectIcon } from '../../constants/subjects'
import { formatTimeAgo } from '../../utils/formatDate'

const QuestionApprovalCard = ({
  question,
  onApprove,
  onReject,
  isLoading = false,
  className = ''
}) => {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectDetails, setRejectDetails] = useState('')

  const labels = ['A', 'B', 'C', 'D']

  const handleReject = () => {
    if (!rejectReason) return
    onReject(question.id || question._id, rejectReason, rejectDetails)
    setShowRejectForm(false)
    setRejectReason('')
    setRejectDetails('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden ${className}`}
    >
      <div
        className={`${getSubjectBgClass(
          question.subject
        )} px-5 py-3 flex items-center justify-between`}
      >
        <div className='flex items-center gap-2'>
          <span className='text-xl'>{getSubjectIcon(question.subject)}</span>
          <span className='text-white font-semibold text-sm capitalize'>
            {question.subject}
          </span>
          {question.isAIGenerated && (
            <span className='bg-white bg-opacity-20 text-white text-xs px-2 py-0.5 rounded-full'>
              🤖 AI
            </span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <DifficultyBadge difficulty={question.difficulty} size='xs' />
          <span className='text-white text-opacity-70 text-xs'>
            {formatTimeAgo(question.createdAt)}
          </span>
        </div>
      </div>

      <div className='p-5'>
        <div className='mb-4'>
          <p className='text-sm font-semibold text-gray-900 leading-relaxed mb-1'>
            {question.questionText}
          </p>
          {question.topic && (
            <p className='text-xs text-gray-400'>Topic: {question.topic}</p>
          )}
        </div>

        <div className='grid grid-cols-1 gap-2 mb-4'>
          {question.options?.map((opt, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm ${
                i === question.correctAnswer
                  ? 'bg-green-50 border border-green-300 text-green-800'
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
            <p className='text-xs font-semibold text-blue-800 mb-1'>
              💡 Explanation
            </p>
            <p className='text-xs text-gray-700'>{question.explanation}</p>
          </div>
        )}

        {question.createdBy && (
          <div className='flex items-center gap-2 mb-4 pb-4 border-b border-gray-100'>
            <div className='w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold text-xs'>
              {question.createdBy.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className='text-xs font-semibold text-gray-700'>
                {question.createdBy.name}
              </p>
              <p className='text-xs text-gray-400'>
                {question.createdBy.email}
              </p>
            </div>
          </div>
        )}

        {!showRejectForm ? (
          <div className='flex gap-2'>
            <Button
              variant='success'
              size='sm'
              fullWidth
              onClick={() => onApprove(question.id || question._id)}
              isLoading={isLoading}
            >
              ✅ Approve
            </Button>
            <Button
              variant='danger'
              size='sm'
              fullWidth
              onClick={() => setShowRejectForm(true)}
              disabled={isLoading}
            >
              ❌ Reject
            </Button>
          </div>
        ) : (
          <div className='flex flex-col gap-3'>
            <select
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className='w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900'
            >
              <option value=''>Select rejection reason...</option>
              <option value='incorrect_answer'>Incorrect Answer</option>
              <option value='unclear_question'>Unclear Question</option>
              <option value='not_curriculum_aligned'>
                Not Curriculum Aligned
              </option>
              <option value='duplicate'>Duplicate Question</option>
              <option value='poor_quality'>Poor Quality</option>
              <option value='other'>Other</option>
            </select>
            <textarea
              value={rejectDetails}
              onChange={e => setRejectDetails(e.target.value)}
              placeholder='Additional details (optional)...'
              rows={2}
              className='w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900 resize-none'
            />
            <div className='flex gap-2'>
              <Button
                variant='danger'
                size='sm'
                fullWidth
                onClick={handleReject}
                disabled={!rejectReason || isLoading}
                isLoading={isLoading}
              >
                Confirm Reject
              </Button>
              <Button
                variant='ghost'
                size='sm'
                fullWidth
                onClick={() => setShowRejectForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default QuestionApprovalCard
