import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../ui/Button'

const ExplanationBox = ({
  explanation,
  aiExplanation = null,
  isCorrect,
  onGetAIExplanation = null,
  isLoadingAI = false,
  className = ''
}) => {
  const [showAI, setShowAI] = useState(false)

  const handleGetAI = async () => {
    if (onGetAIExplanation) {
      setShowAI(true)
      await onGetAIExplanation()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl overflow-hidden border ${
        isCorrect ? 'border-green-200' : 'border-red-200'
      } ${className}`}
    >
      <div
        className={`px-5 py-3 flex items-center gap-2 ${
          isCorrect ? 'bg-green-50' : 'bg-red-50'
        }`}
      >
        <span className='text-xl'>{isCorrect ? '✅' : '❌'}</span>
        <span
          className={`font-bold text-sm ${
            isCorrect ? 'text-green-800' : 'text-red-800'
          }`}
        >
          {isCorrect ? 'Correct Answer!' : 'Incorrect Answer'}
        </span>
      </div>

      {explanation && (
        <div className='px-5 py-4 bg-white'>
          <p className='text-sm text-gray-700 leading-relaxed'>
            <span className='font-semibold text-gray-900'>Explanation: </span>
            {explanation}
          </p>
        </div>
      )}

      {onGetAIExplanation && (
        <div className='px-5 py-4 border-t border-gray-100 bg-gray-50'>
          {!showAI ? (
            <Button
              variant='outline'
              size='sm'
              onClick={handleGetAI}
              leftIcon={<span>🤖</span>}
            >
              Get AI Explanation
            </Button>
          ) : (
            <AnimatePresence>
              {isLoadingAI ? (
                <div className='flex items-center gap-2 text-gray-500 text-sm'>
                  <div className='w-4 h-4 border-2 border-primary-900 border-t-transparent rounded-full animate-spin' />
                  AI is generating explanation...
                </div>
              ) : aiExplanation ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='space-y-2'
                >
                  <div className='flex items-center gap-2 mb-2'>
                    <span>🤖</span>
                    <span className='text-sm font-semibold text-primary-900'>
                      AI Explanation
                    </span>
                  </div>
                  <p className='text-sm text-gray-700 leading-relaxed'>
                    {aiExplanation.mainExplanation}
                  </p>
                  {aiExplanation.keyConceptToRemember && (
                    <div className='mt-3 p-3 bg-primary-50 rounded-xl'>
                      <p className='text-xs font-semibold text-primary-900 mb-1'>
                        💡 Key Concept
                      </p>
                      <p className='text-xs text-primary-800'>
                        {aiExplanation.keyConceptToRemember}
                      </p>
                    </div>
                  )}
                  {aiExplanation.memoryTrick && (
                    <div className='p-3 bg-yellow-50 rounded-xl'>
                      <p className='text-xs font-semibold text-yellow-800 mb-1'>
                        🧠 Memory Trick
                      </p>
                      <p className='text-xs text-yellow-700'>
                        {aiExplanation.memoryTrick}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default ExplanationBox
