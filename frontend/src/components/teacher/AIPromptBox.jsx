import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import Select from '../ui/Select'
import { SUBJECTS, DIFFICULTIES, GRADES } from '../../constants/subjects'

const AIPromptBox = ({
  onGenerate,
  isGenerating = false,
  monthlyUsed = 0,
  monthlyLimit = 100,
  className = ''
}) => {
  const [params, setParams] = useState({
    subject: '',
    difficulty: 'medium',
    count: 1,
    grade: 'Grade 12',
    topic: '',
    additionalInstructions: ''
  })

  const [errors, setErrors] = useState({})

  const remaining = monthlyLimit - monthlyUsed
  const usagePercentage = (monthlyUsed / monthlyLimit) * 100

  const handleChange = e => {
    const { name, value } = e.target
    setParams(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const validate = () => {
    const newErrors = {}
    if (!params.subject) newErrors.subject = 'Please select a subject'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (validate() && remaining > 0) {
      onGenerate({
        ...params,
        count: parseInt(params.count)
      })
    }
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className='bg-gradient-to-r from-purple-700 to-indigo-700 px-6 py-5 text-white'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl'>
            🤖
          </div>
          <div>
            <h3 className='font-bold text-lg'>AI Question Generator</h3>
            <p className='text-white text-opacity-80 text-sm'>
              Generate high-quality exam questions instantly
            </p>
          </div>
        </div>

        {/* Usage bar */}
        <div className='bg-white bg-opacity-10 rounded-xl p-3'>
          <div className='flex justify-between text-sm mb-2'>
            <span className='text-white text-opacity-80'>Monthly Usage</span>
            <span className='font-semibold'>
              {monthlyUsed}/{monthlyLimit}
            </span>
          </div>
          <div className='w-full h-2 bg-white bg-opacity-20 rounded-full overflow-hidden'>
            <div
              className={`h-full rounded-full transition-all ${
                usagePercentage >= 90
                  ? 'bg-red-400'
                  : usagePercentage >= 70
                  ? 'bg-yellow-400'
                  : 'bg-green-400'
              }`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
          <p className='text-white text-opacity-70 text-xs mt-1'>
            {remaining} generation{remaining !== 1 ? 's' : ''} remaining this
            month
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className='p-6'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
          <Select
            label='Subject'
            name='subject'
            value={params.subject}
            onChange={handleChange}
            placeholder='Select subject'
            error={errors.subject}
            required
            options={SUBJECTS.map(s => ({
              value: s.id,
              label: `${s.icon} ${s.nameEn}`
            }))}
          />
          <Select
            label='Difficulty'
            name='difficulty'
            value={params.difficulty}
            onChange={handleChange}
            options={DIFFICULTIES.map(d => ({
              value: d.id,
              label: `${d.icon} ${d.label}`
            }))}
          />
          <Select
            label='Grade'
            name='grade'
            value={params.grade}
            onChange={handleChange}
            options={[
              ...GRADES.map(g => ({ value: g.id, label: g.label })),
              { value: 'Both', label: 'Both Grades' }
            ]}
          />
          <div>
            <label className='label'>Number of Questions</label>
            <select
              name='count'
              value={params.count}
              onChange={handleChange}
              className='input'
            >
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>
                  {n} Question{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='mb-4'>
          <label className='label'>Topic / Chapter (Optional)</label>
          <input
            name='topic'
            value={params.topic}
            onChange={handleChange}
            placeholder="e.g. Quadratic Equations, Cell Biology, Newton's Laws..."
            className='input'
          />
        </div>

        <div className='mb-6'>
          <label className='label'>Additional Instructions (Optional)</label>
          <textarea
            name='additionalInstructions'
            value={params.additionalInstructions}
            onChange={handleChange}
            placeholder='Any specific requirements for the questions...'
            rows={2}
            className='input resize-none'
          />
        </div>

        {remaining <= 0 ? (
          <div className='p-4 bg-red-50 border border-red-200 rounded-2xl text-center'>
            <p className='text-red-700 text-sm font-semibold'>
              🚫 Monthly AI generation limit reached
            </p>
            <p className='text-red-500 text-xs mt-1'>
              Your limit resets at the beginning of next month
            </p>
          </div>
        ) : (
          <Button
            type='submit'
            variant='primary'
            size='lg'
            fullWidth
            isLoading={isGenerating}
            disabled={isGenerating || remaining <= 0}
            className='bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800'
          >
            {isGenerating
              ? 'Generating Questions...'
              : `🤖 Generate ${params.count} Question${
                  params.count > 1 ? 's' : ''
                }`}
          </Button>
        )}

        <p className='text-xs text-gray-400 text-center mt-3'>
          Each generation costs 1 of your monthly allowance
        </p>
      </form>
    </div>
  )
}

export default AIPromptBox
