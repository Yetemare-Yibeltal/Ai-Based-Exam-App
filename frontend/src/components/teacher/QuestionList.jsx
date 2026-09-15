import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import { StatusBadge } from '../ui/Badge'
import DifficultyBadge from '../quiz/DifficultyBadge'
import SearchBar from '../ui/SearchBar'
import SubjectFilter from '../quiz/SubjectFilter'
import { formatTimeAgo } from '../../utils/formatDate'
import { getSubjectIcon } from '../../constants/subjects'
import ConfirmDialog from '../ui/ConfirmDialog'

const QuestionList = ({
  questions = [],
  isLoading = false,
  onEdit,
  onDelete,
  onSubmit,
  onValidate,
  className = ''
}) => {
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    question: null
  })
  const [isDeleting, setIsDeleting] = useState(false)

  const filtered = questions.filter(q => {
    const matchSearch =
      !search ||
      q.questionText?.toLowerCase().includes(search.toLowerCase()) ||
      q.topic?.toLowerCase().includes(search.toLowerCase())
    const matchSubject = !subjectFilter || q.subject === subjectFilter
    const matchStatus = !statusFilter || q.status === statusFilter
    return matchSearch && matchSubject && matchStatus
  })

  const handleDelete = async () => {
    if (!deleteDialog.question) return
    setIsDeleting(true)
    await onDelete(deleteDialog.question.id || deleteDialog.question._id)
    setIsDeleting(false)
    setDeleteDialog({ isOpen: false, question: null })
  }

  if (isLoading) {
    return (
      <div className='flex flex-col gap-3'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className='bg-white rounded-2xl border border-gray-100 p-5 animate-pulse'
          >
            <div className='h-4 bg-gray-200 rounded w-3/4 mb-3' />
            <div className='h-3 bg-gray-100 rounded w-1/2' />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-3 mb-6'>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder='Search questions...'
          className='flex-1'
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className='px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-900'
        >
          <option value=''>All Status</option>
          <option value='draft'>Draft</option>
          <option value='pending'>Pending</option>
          <option value='approved'>Approved</option>
          <option value='rejected'>Rejected</option>
        </select>
      </div>

      <div className='mb-4'>
        <SubjectFilter
          selected={subjectFilter}
          onChange={setSubjectFilter}
          showAll
        />
      </div>

      {filtered.length === 0 ? (
        <div className='text-center py-12 text-gray-400'>
          <div className='text-4xl mb-2'>❓</div>
          <p className='text-sm'>No questions found</p>
        </div>
      ) : (
        <div className='flex flex-col gap-4'>
          {filtered.map((question, i) => (
            <motion.div
              key={question.id || question._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className='bg-white rounded-2xl border border-gray-100 shadow-card p-5'
            >
              <div className='flex items-start justify-between gap-4'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-2 flex-wrap'>
                    <span className='text-lg'>
                      {getSubjectIcon(question.subject)}
                    </span>
                    <StatusBadge status={question.status} />
                    <DifficultyBadge
                      difficulty={question.difficulty}
                      size='xs'
                    />
                    {question.isAIGenerated && (
                      <span className='text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold'>
                        🤖 AI
                      </span>
                    )}
                    <span className='text-xs text-gray-400'>
                      {formatTimeAgo(question.createdAt)}
                    </span>
                  </div>
                  <p className='text-sm text-gray-800 font-medium leading-relaxed line-clamp-2'>
                    {question.questionText}
                  </p>
                  {question.topic && (
                    <p className='text-xs text-gray-400 mt-1'>
                      Topic: {question.topic}
                    </p>
                  )}
                  {question.status === 'rejected' && question.rejectionReason && (
                    <div className='mt-2 p-2 bg-red-50 rounded-lg border border-red-100'>
                      <p className='text-xs text-red-700'>
                        <span className='font-semibold'>
                          Rejection reason:{' '}
                        </span>
                        {question.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className='flex items-center gap-2 mt-4 pt-4 border-t border-gray-100'>
                {(question.status === 'draft' ||
                  question.status === 'rejected') &&
                  onEdit && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onEdit(question)}
                    >
                      ✏️ Edit
                    </Button>
                  )}
                {question.status === 'draft' && onSubmit && (
                  <Button
                    variant='primary'
                    size='sm'
                    onClick={() => onSubmit(question.id || question._id)}
                  >
                    Submit for Review
                  </Button>
                )}
                {onValidate && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onValidate(question.id || question._id)}
                  >
                    🤖 Validate
                  </Button>
                )}
                {(question.status === 'draft' ||
                  question.status === 'rejected') &&
                  onDelete && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        setDeleteDialog({ isOpen: true, question })
                      }
                      className='text-red-500 ml-auto'
                    >
                      🗑️
                    </Button>
                  )}
                {question.timesUsed > 0 && (
                  <span className='text-xs text-gray-400 ml-auto'>
                    Used {question.timesUsed} times
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, question: null })}
        onConfirm={handleDelete}
        title='Delete Question'
        message='Are you sure you want to delete this question? This action cannot be undone.'
        confirmText='Delete'
        variant='danger'
        isLoading={isDeleting}
      />
    </div>
  )
}

export default QuestionList
