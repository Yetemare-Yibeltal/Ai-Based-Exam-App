import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import TeacherLayout from '../../components/layout/TeacherLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import AIPromptBox from '../../components/teacher/AIPromptBox'
import GeneratedQuestionCard from '../../components/teacher/GeneratedQuestionCard'
import AIHistoryPanel from '../../components/ai/AIHistoryPanel'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import QuestionForm from '../../components/teacher/QuestionForm'
import useTeacherStore from '../../store/useTeacherStore'
import useAuthStore from '../../store/useAuthStore'
import aiAPI from '../../api/ai.api'

const TeacherAIGenerate = () => {
  const { user } = useAuthStore()
  const { generateAIQuestion, isGenerating, submitForApproval } =
    useTeacherStore()
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [aiHistory, setAIHistory] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [submittingId, setSubmittingId] = useState(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await aiAPI.getMyHistory({ limit: 10 })
        setAIHistory(res.data.data?.logs || [])
      } catch (error) {
        console.error('Failed to load AI history:', error)
      } finally {
        setIsLoadingHistory(false)
      }
    }
    fetchHistory()
  }, [])

  const handleGenerate = async params => {
    const result = await generateAIQuestion(params)
    if (result.success) {
      const newQuestions = result.data?.questions || []
      setGeneratedQuestions(prev => [...newQuestions, ...prev])
      toast.success(`${newQuestions.length} question(s) generated!`)
    } else {
      toast.error(result.error || 'Failed to generate questions')
    }
  }

  const handleAccept = async question => {
    const id = question.id || question._id
    setSubmittingId(id)
    const result = await submitForApproval(
      id,
      'AI generated question ready for review'
    )
    if (result.success) {
      toast.success('Question submitted for admin review!')
      setGeneratedQuestions(prev => prev.filter(q => (q.id || q._id) !== id))
    } else {
      toast.error(result.error || 'Failed to submit question')
    }
    setSubmittingId(null)
  }

  const handleDiscard = question => {
    const id = question.id || question._id
    setGeneratedQuestions(prev => prev.filter(q => (q.id || q._id) !== id))
    toast.success('Question discarded')
  }

  const handleClearAll = () => {
    setGeneratedQuestions([])
  }

  return (
    <TeacherLayout>
      <PageWrapper
        title='AI Question Generator'
        subtitle='Generate high-quality exam questions using Claude AI'
      >
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-1'>
            <AIPromptBox
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              monthlyUsed={user?.aiGenerationsThisMonth || 0}
              monthlyLimit={100}
            />
            <div className='mt-6'>
              <AIHistoryPanel logs={aiHistory} isLoading={isLoadingHistory} />
            </div>
          </div>

          <div className='lg:col-span-2'>
            {generatedQuestions.length === 0 && !isGenerating && (
              <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
                <div className='text-6xl mb-4'>🤖</div>
                <p className='text-lg font-semibold text-gray-600 mb-2'>
                  No questions generated yet
                </p>
                <p className='text-sm text-center max-w-xs'>
                  Configure your settings and click "Generate" to create
                  AI-powered exam questions
                </p>
              </div>
            )}

            {isGenerating && (
              <div className='flex flex-col items-center justify-center py-20'>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className='text-6xl mb-4'
                >
                  ⚙️
                </motion.div>
                <p className='text-lg font-semibold text-gray-700'>
                  AI is generating questions...
                </p>
                <p className='text-sm text-gray-500 mt-1'>
                  This may take 10-30 seconds
                </p>
              </div>
            )}

            {generatedQuestions.length > 0 && (
              <div>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='font-bold text-gray-900'>
                    {generatedQuestions.length} Generated Question
                    {generatedQuestions.length !== 1 ? 's' : ''}
                  </h3>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleClearAll}
                    className='text-red-500'
                  >
                    Clear All
                  </Button>
                </div>

                <AnimatePresence>
                  <div className='flex flex-col gap-4'>
                    {generatedQuestions.map((question, i) => (
                      <GeneratedQuestionCard
                        key={question.id || question._id || i}
                        question={question}
                        index={i}
                        onAccept={handleAccept}
                        onEdit={setEditingQuestion}
                        onDiscard={handleDiscard}
                        isSubmitting={
                          submittingId === (question.id || question._id)
                        }
                      />
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <Modal
          isOpen={!!editingQuestion}
          onClose={() => setEditingQuestion(null)}
          title='Edit Generated Question'
          size='lg'
        >
          {editingQuestion && (
            <QuestionForm
              initialData={editingQuestion}
              onSubmit={data => {
                setGeneratedQuestions(prev =>
                  prev.map(q =>
                    (q.id || q._id) ===
                    (editingQuestion.id || editingQuestion._id)
                      ? { ...q, ...data }
                      : q
                  )
                )
                setEditingQuestion(null)
                toast.success('Question updated locally')
              }}
              submitLabel='Update Question'
            />
          )}
        </Modal>
      </PageWrapper>
    </TeacherLayout>
  )
}

export default TeacherAIGenerate
