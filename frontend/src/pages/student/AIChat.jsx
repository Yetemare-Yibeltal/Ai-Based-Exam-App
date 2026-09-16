import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StudentLayout from '../../components/layout/StudentLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import SubjectFilter from '../../components/quiz/SubjectFilter'
import useAI from '../../hooks/useAI'
import useAuthStore from '../../store/useAuthStore'

const AIChat = () => {
  const { user } = useAuthStore()
  const {
    isLoading,
    getStudyTips,
    getSubjectTips,
    analyzeWeakSubjects,
    getPersonalizedPlan
  } = useAI()
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `Hello ${
        user?.name?.split(' ')[0] || 'Student'
      }! 👋 I'm your HEROY AI study coach. I can help you with:\n\n📚 Personalized study tips\n📊 Weak subject analysis\n📅 Customized study plans\n💡 Subject-specific strategies\n\nWhat would you like help with today?`,
      timestamp: new Date()
    }
  ])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (role, content) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now(), role, content, timestamp: new Date() }
    ])
  }

  const handleQuickAction = async action => {
    setIsTyping(true)

    const userMessages = {
      tips: 'Give me personalized study tips based on my performance',
      weak: 'Analyze my weak subjects and give me recommendations',
      plan: 'Create a personalized study plan for me',
      subject: `Give me study tips for ${selectedSubject}`
    }

    addMessage('user', userMessages[action])

    try {
      let result
      let responseContent = ''

      if (action === 'tips') {
        result = await getStudyTips()
        if (result.success && result.data) {
          responseContent = `Here are your personalized study tips:\n\n`
          result.data.tips?.forEach((tip, i) => {
            responseContent += `**${i + 1}. ${tip.title}**\n${
              tip.description
            }\n\n`
          })
          if (result.data.motivationalMessage) {
            responseContent += `\n💪 ${result.data.motivationalMessage}`
          }
        }
      } else if (action === 'weak') {
        result = await analyzeWeakSubjects()
        if (result.success && result.data) {
          if (!result.data.hasData) {
            responseContent =
              result.data.message ||
              'Complete some quizzes first to get weak subject analysis!'
          } else {
            responseContent = result.data.aiAnalysis || ''
            if (result.data.weakSubjects?.length > 0) {
              responseContent += '\n\n⚠️ **Subjects needing improvement:**\n'
              result.data.weakSubjects.forEach(s => {
                responseContent += `• ${s.subject}: ${Math.round(
                  s.avgScore
                )}% average\n`
              })
            }
            if (result.data.encouragement) {
              responseContent += `\n\n💪 ${result.data.encouragement}`
            }
          }
        }
      } else if (action === 'plan') {
        result = await getPersonalizedPlan({
          daysUntilExam: 90,
          targetScore: 80
        })
        if (result.success && result.data?.plan) {
          const plan = result.data.plan
          responseContent = `**${plan.planTitle || 'Your Study Plan'}**\n\n`
          responseContent += `${plan.overview || ''}\n\n`
          if (plan.priorityOrder?.length > 0) {
            responseContent += `📚 **Priority Order:** ${plan.priorityOrder.join(
              ' → '
            )}\n\n`
          }
          if (plan.dailyRoutine) {
            responseContent += `**Daily Routine:**\n`
            responseContent += `• Morning: ${plan.dailyRoutine.morning}\n`
            responseContent += `• Afternoon: ${plan.dailyRoutine.afternoon}\n`
            responseContent += `• Evening: ${plan.dailyRoutine.evening}\n\n`
          }
          responseContent += `📈 **Estimated outcome:** ${
            plan.estimatedFinalScore || 'Significant improvement expected'
          }`
        }
      } else if (action === 'subject' && selectedSubject) {
        result = await getSubjectTips(selectedSubject)
        if (result.success && result.data) {
          responseContent = `Here are your ${selectedSubject} study tips:\n\n`
          result.data.tips?.forEach((tip, i) => {
            responseContent += `**${i + 1}. ${tip.title}**\n${
              tip.description
            }\n\n`
          })
          if (result.data.keyTopics?.length > 0) {
            responseContent += `\n🎯 **Key Topics:** ${result.data.keyTopics.join(
              ', '
            )}`
          }
        }
      }

      if (!responseContent) {
        responseContent =
          'I encountered an issue generating your response. Please try again!'
      }

      addMessage('assistant', responseContent)
    } catch (error) {
      addMessage(
        'assistant',
        'Sorry, I encountered an error. Please try again!'
      )
    } finally {
      setIsTyping(false)
    }
  }

  const quickActions = [
    {
      id: 'tips',
      label: '🤖 AI Study Tips',
      color:
        'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100'
    },
    {
      id: 'weak',
      label: '⚠️ Weak Subjects',
      color: 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100'
    },
    {
      id: 'plan',
      label: '📅 Study Plan',
      color: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
    },
    {
      id: 'subject',
      label: `📚 ${
        selectedSubject
          ? selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)
          : 'Subject'
      } Tips`,
      color: 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100',
      requiresSubject: true
    }
  ]

  const formatMessage = content => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={i} className='font-bold text-gray-900 mt-2'>
            {line.slice(2, -2)}
          </p>
        )
      }
      if (line.startsWith('• ')) {
        return (
          <p key={i} className='ml-4 text-gray-700'>
            • {line.slice(2)}
          </p>
        )
      }
      if (
        line.startsWith('📚') ||
        line.startsWith('📊') ||
        line.startsWith('📅') ||
        line.startsWith('💡') ||
        line.startsWith('💪') ||
        line.startsWith('📈') ||
        line.startsWith('🎯') ||
        line.startsWith('⚠️')
      ) {
        return (
          <p key={i} className='mt-2 font-medium text-gray-800'>
            {line}
          </p>
        )
      }
      return (
        <p key={i} className='text-gray-700'>
          {line}
        </p>
      )
    })
  }

  return (
    <StudentLayout>
      <PageWrapper
        title='AI Study Coach'
        subtitle='Get personalized study guidance powered by AI'
      >
        <div className='max-w-4xl mx-auto'>
          {/* Subject Filter */}
          <div className='mb-4'>
            <p className='text-sm text-gray-500 mb-2'>
              Select subject for subject-specific tips:
            </p>
            <SubjectFilter
              selected={selectedSubject}
              onChange={setSelectedSubject}
              showAll={false}
            />
          </div>

          {/* Quick Actions */}
          <div className='flex flex-wrap gap-2 mb-6'>
            {quickActions.map(action => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                disabled={
                  isLoading ||
                  isTyping ||
                  (action.requiresSubject && !selectedSubject)
                }
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Chat Window */}
          <div className='bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden'>
            {/* Chat Header */}
            <div className='bg-gradient-to-r from-purple-700 to-indigo-700 px-6 py-4 flex items-center gap-3'>
              <div className='w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl'>
                🤖
              </div>
              <div>
                <p className='text-white font-bold'>HEROY AI Coach</p>
                <div className='flex items-center gap-1.5'>
                  <span className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
                  <span className='text-white text-opacity-80 text-xs'>
                    Online
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className='h-96 overflow-y-auto p-6 flex flex-col gap-4'>
              <AnimatePresence>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${
                      msg.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        msg.role === 'user'
                          ? 'bg-primary-900 text-white'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {msg.role === 'user'
                        ? user?.name?.charAt(0)?.toUpperCase() || 'U'
                        : '🤖'}
                    </div>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary-900 text-white rounded-tr-none'
                          : 'bg-gray-50 border border-gray-100 rounded-tl-none'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className='space-y-1'>
                          {formatMessage(msg.content)}
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                      <p
                        className={`text-xs mt-2 ${
                          msg.role === 'user'
                            ? 'text-white text-opacity-70'
                            : 'text-gray-400'
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='flex gap-3'
                >
                  <div className='w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm'>
                    🤖
                  </div>
                  <div className='bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3'>
                    <div className='flex gap-1'>
                      {[0, 1, 2].map(i => (
                        <motion.span
                          key={i}
                          className='w-2 h-2 bg-gray-400 rounded-full'
                          animate={{ y: [0, -6, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className='border-t border-gray-100 p-4 bg-gray-50'>
              <div className='flex items-center gap-3'>
                <div className='flex-1 flex flex-wrap gap-2'>
                  <p className='text-xs text-gray-500 w-full'>
                    💡 Click one of the quick action buttons above to get AI
                    assistance
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setMessages([messages[0]])}
                  className='text-gray-400'
                >
                  Clear Chat
                </Button>
              </div>
            </div>
          </div>

          <p className='text-xs text-center text-gray-400 mt-4'>
            🤖 AI responses are generated by Claude and are for educational
            guidance purposes.
          </p>
        </div>
      </PageWrapper>
    </StudentLayout>
  )
}

export default AIChat
