import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/layout/AdminLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import QuestionApprovalCard from '../../components/admin/QuestionApprovalCard'
import SubjectFilter from '../../components/quiz/SubjectFilter'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import questionsAPI from '../../api/questions.api'

const AdminApproveQuestions = () => {
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [subjectFilter, setSubjectFilter] = useState('')
  const [loadingId, setLoadingId] = useState(null)
  const [totalPending, setTotalPending] = useState(0)
  const [isBulkApproving, setIsBulkApproving] = useState(false)

  const fetchPending = async () => {
    setIsLoading(true)
    try {
      const res = await questionsAPI.getPendingQuestions({
        subject: subjectFilter || undefined,
        limit: 20
      })
      setQuestions(res.data.data || [])
      setTotalPending(res.data.pagination?.total || 0)
    } catch (error) {
      console.error('Failed to load pending questions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPending()
  }, [subjectFilter])

  const handleApprove = async (id, note = null) => {
    setLoadingId(id)
    try {
      await questionsAPI.approveQuestion(id, { note })
      toast.success('Question approved!')
      setQuestions(prev => prev.filter(q => (q.id || q._id) !== id))
      setTotalPending(prev => prev - 1)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve question')
    } finally {
      setLoadingId(null)
    }
  }

  const handleReject = async (id, reason, details) => {
    setLoadingId(id)
    try {
      await questionsAPI.rejectQuestion(id, { reason, details })
      toast.success('Question rejected and teacher notified')
      setQuestions(prev => prev.filter(q => (q.id || q._id) !== id))
      setTotalPending(prev => prev - 1)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject question')
    } finally {
      setLoadingId(null)
    }
  }

  const handleBulkApprove = async () => {
    if (questions.length === 0) return
    setIsBulkApproving(true)
    try {
      const ids = questions.map(q => q.id || q._id)
      await questionsAPI.bulkApprove({ questionIds: ids })
      toast.success(`${questions.length} questions approved!`)
      fetchPending()
    } catch (error) {
      toast.error('Failed to bulk approve questions')
    } finally {
      setIsBulkApproving(false)
    }
  }

  return (
    <AdminLayout>
      <PageWrapper
        title='Approve Questions'
        subtitle={`${totalPending} question${
          totalPending !== 1 ? 's' : ''
        } waiting for review`}
        actions={
          questions.length > 1 && (
            <Button
              variant='success'
              size='sm'
              onClick={handleBulkApprove}
              isLoading={isBulkApproving}
            >
              ✅ Approve All ({questions.length})
            </Button>
          )
        }
      >
        <div className='mb-6'>
          <SubjectFilter
            selected={subjectFilter}
            onChange={setSubjectFilter}
            showAll
          />
        </div>

        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <LoadingSpinner size='lg' text='Loading pending questions...' />
          </div>
        ) : questions.length === 0 ? (
          <EmptyState
            icon='✅'
            title='All caught up!'
            message='No pending questions to review right now. Check back later.'
          />
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {questions.map((question, i) => (
              <QuestionApprovalCard
                key={question.id || question._id}
                question={question}
                onApprove={handleApprove}
                onReject={handleReject}
                isLoading={loadingId === (question.id || question._id)}
              />
            ))}
          </div>
        )}
      </PageWrapper>
    </AdminLayout>
  )
}

export default AdminApproveQuestions
