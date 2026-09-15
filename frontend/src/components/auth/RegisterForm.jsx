import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Select from '../ui/Select'
import { validateRegisterForm } from '../../utils/validateForm'
import { GRADES } from '../../constants/subjects'

const RegisterForm = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    grade: '',
    school: ''
  })
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState(1)

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const validateStep1 = () => {
    const newErrors = {}
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (!formData.grade) newErrors.grade = 'Please select your grade'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (validateStep2()) {
      const { confirmPassword, ...submitData } = formData
      onSubmit(submitData)
    }
  }

  return (
    <div>
      {/* Step indicators */}
      <div className='flex items-center gap-2 mb-6'>
        {[1, 2].map(s => (
          <div key={s} className='flex items-center gap-2'>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s
                  ? 'bg-primary-900 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
            {s < 2 && (
              <div
                className={`flex-1 h-0.5 w-8 transition-all ${
                  step > s ? 'bg-primary-900' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
        <div className='ml-2 text-xs text-gray-500'>
          Step {step} of 2: {step === 1 ? 'Account Info' : 'Password & Grade'}
        </div>
      </div>

      <motion.form
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        onSubmit={handleSubmit}
        className='flex flex-col gap-4'
      >
        {step === 1 ? (
          <>
            <Input
              label='Full Name'
              name='name'
              type='text'
              value={formData.name}
              onChange={handleChange}
              placeholder='Your full name'
              error={errors.name}
              required
              leftIcon={<span>👤</span>}
              autoComplete='name'
            />
            <Input
              label='Email Address'
              name='email'
              type='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='your@email.com'
              error={errors.email}
              required
              leftIcon={<span>✉️</span>}
              autoComplete='email'
            />
            <Input
              label='School (Optional)'
              name='school'
              type='text'
              value={formData.school}
              onChange={handleChange}
              placeholder='Your school name'
              leftIcon={<span>🏫</span>}
            />
            <Button
              type='button'
              variant='primary'
              size='lg'
              fullWidth
              onClick={handleNext}
            >
              Next Step →
            </Button>
          </>
        ) : (
          <>
            <Input
              label='Password'
              name='password'
              type='password'
              value={formData.password}
              onChange={handleChange}
              placeholder='Min. 8 characters'
              error={errors.password}
              required
              leftIcon={<span>🔒</span>}
              helperText='Must contain uppercase, lowercase, number and special character'
              autoComplete='new-password'
            />
            <Input
              label='Confirm Password'
              name='confirmPassword'
              type='password'
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder='Confirm your password'
              error={errors.confirmPassword}
              required
              leftIcon={<span>🔒</span>}
              autoComplete='new-password'
            />
            <Select
              label='Grade Level'
              name='grade'
              value={formData.grade}
              onChange={handleChange}
              placeholder='Select your grade'
              error={errors.grade}
              required
              options={GRADES.map(g => ({ value: g.id, label: g.label }))}
            />
            <div className='flex gap-3 mt-2'>
              <Button
                type='button'
                variant='outline'
                size='lg'
                fullWidth
                onClick={() => setStep(1)}
              >
                ← Back
              </Button>
              <Button
                type='submit'
                variant='primary'
                size='lg'
                fullWidth
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </div>
          </>
        )}
      </motion.form>

      <div className='text-center mt-4'>
        <p className='text-sm text-gray-500'>
          Already have an account?{' '}
          <Link
            to='/login'
            className='text-primary-900 font-semibold hover:underline'
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterForm
