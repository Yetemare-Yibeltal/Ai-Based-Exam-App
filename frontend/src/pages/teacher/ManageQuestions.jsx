import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import TeacherLayout from '../../components/layout/TeacherLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import QuestionList from '../../components/teacher/QuestionList'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import QuestionForm from '../../components/teacher/QuestionForm'
import useTeacherStore from '../../store/useTeacherStore'
import { ROUTES } from '../../constants/routes'

const TeacherManageQuestions = () => {
  const navigate = useNavigate()
  const {
    questions,
    questionsTotal,
    isLoading,
    fetchMyQuestions,
    updateQuestion,
    deleteQuestion,
    submitForApproval
  } = useTeacherStore()

  const [editingQuestion, setEditingQuestion] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(null)

  useEffect(() => {
    fetchMyQuestions()
  }, [])

  const handleEdit = question => {
    setEditingQuestion(question)
  }

  const handleUpdate = async formData => {
    if (!editingQuestion) return
    setIsUpdating(true)
    const result = await updateQuestion(
      editingQuestion.id || editingQuestion._id,
      formData
    )
    if (result.success) {
      toast.success('Question updated successfully!')
      setEditingQuestion(null)
    } else {
      toast.error(result.error || 'Failed to update question')
    }
    setIsUpdating(false)
  }

  const handleDelete = async id => {
    const result = await deleteQuestion(id)
    if (result.success) {
      toast.success('Question deleted')
    } else {
      toast.error(result.error || 'Failed to delete question')
    }
  }

  const handleSubmit = async id => {
    setIsSubmitting(id)
    const result = await submitForApproval(id, 'Ready for review')
    if (result.success) {
      toast.success('Question submitted for review!')
    } else {
      toast.error(result.error || 'Failed to submit question')
    }
    setIsSubmitting(null)
  }

  return (
    <TeacherLayout>
      <PageWrapper
        title='My Questions'
        subtitle={`${questionsTotal} total questions`}
        actions={
          <div className='flex gap-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => navigate(ROUTES.TEACHER_AI_GENERATE)}
            >
              🤖 AI Generate
            </Button>
            <Button
              variant='primary'
              size='sm'
              onClick={() => navigate(ROUTES.TEACHER_CREATE_QUESTION)}
            >
              ✍️ Create New
            </Button>
          </div>
        }
      >
        <QuestionList
          questions={questions}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
        />

        <Modal
          isOpen={!!editingQuestion}
          onClose={() => setEditingQuestion(null)}
          title='Edit Question'
          size='lg'
        >
          {editingQuestion && (
            <QuestionForm
              initialData={editingQuestion}
              onSubmit={handleUpdate}
              isLoading={isUpdating}
              submitLabel='Save Changes'
            />
          )}
        </Modal>
      </PageWrapper>
    </TeacherLayout>
  )
}

export default TeacherManageQuestions
