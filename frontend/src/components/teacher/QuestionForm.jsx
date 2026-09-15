import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Select from '../ui/Select'
import { SUBJECTS, DIFFICULTIES, GRADES } from '../../constants/subjects'

const QuestionForm = ({
  initialData = null,
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Question',
  className = ''
}) => {
  const [formData, setFormData] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    subject: '',
    difficulty: 'medium',
    grade: 'Grade 12',
    topic: '',
    explanation: '',
    year: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        questionText: initialData.questionText || '',
        options: initialData.options || ['', '', '', ''],
        correctAnswer: initialData.correctAnswer?.toString() || '',
        subject: initialData.subject || '',
        difficulty: initialData.difficulty || 'medium',
        grade: initialData.grade || 'Grade 12',
        topic: initialData.topic || '',
        explanation: initialData.explanation || '',
        year: initialData.year?.toString() || ''
      })
    }
  }, [initialData])

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData(prev => ({ ...prev, options: newOptions }))
    if (errors[`option_${index}`]) {
      setErrors(prev => ({ ...prev, [`option_${index}`]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.questionText || formData.questionText.trim().length < 10) {
      newErrors.questionText = 'Question must be at least 10 characters'
    }
    formData.options.forEach((opt, i) => {
      if (!opt || !opt.trim()) {
        newErrors[`option_${i}`] = `Option ${String.fromCharCode(
          65 + i
        )} is required`
      }
    })
    if (formData.correctAnswer === '' || formData.correctAnswer === undefined) {
      newErrors.correctAnswer = 'Please select the correct answer'
    }
    if (!formData.subject) newErrors.subject = 'Subject is required'
    if (!formData.difficulty) newErrors.difficulty = 'Difficulty is required'
    if (!formData.explanation || formData.explanation.trim().length < 10) {
      newErrors.explanation = 'Explanation must be at least 10 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        ...formData,
        correctAnswer: parseInt(formData.correctAnswer),
        year: formData.year ? parseInt(formData.year) : undefined
      })
    }
  }

  const labels = ['A', 'B', 'C', 'D']

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className={`flex flex-col gap-6 ${className}`}
    >
      {/* Question Text */}
      <div>
        <label className='label'>
          Question Text <span className='text-red-500'>*</span>
        </label>
        <textarea
          name='questionText'
          value={formData.questionText}
          onChange={handleChange}
          placeholder='Enter your question here...'
          rows={3}
          className={`input resize-none ${
            errors.questionText ? 'input-error' : ''
          }`}
        />
        {errors.questionText && (
          <p className='error-text'>⚠️ {errors.questionText}</p>
        )}
      </div>

      {/* Options */}
      <div>
        <label className='label'>
          Answer Options <span className='text-red-500'>*</span>
        </label>
        <div className='flex flex-col gap-3'>
          {formData.options.map((option, i) => (
            <div key={i} className='flex items-center gap-3'>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 border-2 cursor-pointer transition-all ${
                  formData.correctAnswer === i.toString()
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-200 text-gray-500 hover:border-primary-900'
                }`}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    correctAnswer: i.toString()
                  }))
                  if (errors.correctAnswer)
                    setErrors(prev => ({ ...prev, correctAnswer: null }))
                }}
              >
                {formData.correctAnswer === i.toString() ? '✓' : labels[i]}
              </div>
              <div className='flex-1'>
                <Input
                  value={option}
                  onChange={e => handleOptionChange(i, e.target.value)}
                  placeholder={`Option ${labels[i]}`}
                  error={errors[`option_${i}`]}
                />
              </div>
            </div>
          ))}
        </div>
        {errors.correctAnswer && (
          <p className='error-text mt-2'>⚠️ {errors.correctAnswer}</p>
        )}
        <p className='text-xs text-gray-400 mt-2'>
          Click the letter badge to mark the correct answer (shown in green ✓)
        </p>
      </div>

      {/* Subject, Difficulty, Grade */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <Select
          label='Subject'
          name='subject'
          value={formData.subject}
          onChange={handleChange}
          placeholder='Select subject'
          error={errors.subject}
          required
          options={SUBJECTS.map(s => ({ value: s.id, label: s.nameEn }))}
        />
        <Select
          label='Difficulty'
          name='difficulty'
          value={formData.difficulty}
          onChange={handleChange}
          required
          options={DIFFICULTIES.map(d => ({ value: d.id, label: d.label }))}
        />
        <Select
          label='Grade'
          name='grade'
          value={formData.grade}
          onChange={handleChange}
          required
          options={[
            ...GRADES.map(g => ({ value: g.id, label: g.label })),
            { value: 'Both', label: 'Both Grades' }
          ]}
        />
      </div>

      {/* Topic and Year */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <Input
          label='Topic (Optional)'
          name='topic'
          value={formData.topic}
          onChange={handleChange}
          placeholder='e.g. Linear Equations'
        />
        <Input
          label='Exam Year (Optional)'
          name='year'
          type='number'
          value={formData.year}
          onChange={handleChange}
          placeholder='e.g. 2022'
          min='2000'
          max={new Date().getFullYear()}
        />
      </div>

      {/* Explanation */}
      <div>
        <label className='label'>
          Explanation <span className='text-red-500'>*</span>
        </label>
        <textarea
          name='explanation'
          value={formData.explanation}
          onChange={handleChange}
          placeholder='Explain why the correct answer is right and why others are wrong...'
          rows={4}
          className={`input resize-none ${
            errors.explanation ? 'input-error' : ''
          }`}
        />
        {errors.explanation && (
          <p className='error-text'>⚠️ {errors.explanation}</p>
        )}
      </div>

      <Button
        type='submit'
        variant='primary'
        size='lg'
        fullWidth
        isLoading={isLoading}
      >
        {submitLabel}
      </Button>
    </motion.form>
  )
}

export default QuestionForm
