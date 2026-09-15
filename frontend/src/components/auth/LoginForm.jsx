import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { validateEmail } from '../../utils/validateForm'

const LoginForm = ({
  onSubmit,
  isLoading = false,
  role = 'student',
  registerLink = '/register',
  forgotPasswordLink = '/forgot-password'
}) => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const validate = () => {
    const newErrors = {}
    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError
    if (!formData.password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData.email, formData.password)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className='flex flex-col gap-5'
    >
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

      <div>
        <Input
          label='Password'
          name='password'
          type='password'
          value={formData.password}
          onChange={handleChange}
          placeholder='Enter your password'
          error={errors.password}
          required
          leftIcon={<span>🔒</span>}
          autoComplete='current-password'
        />
        <div className='flex justify-end mt-1.5'>
          <Link
            to={forgotPasswordLink}
            className='text-xs text-primary-900 hover:underline font-medium'
          >
            Forgot Password?
          </Link>
        </div>
      </div>

      <Button
        type='submit'
        variant='primary'
        size='lg'
        fullWidth
        isLoading={isLoading}
        className='mt-2'
      >
        Sign In
      </Button>

      {role === 'student' && (
        <div className='text-center'>
          <p className='text-sm text-gray-500'>
            Don't have an account?{' '}
            <Link
              to={registerLink}
              className='text-primary-900 font-semibold hover:underline'
            >
              Create one free
            </Link>
          </p>
        </div>
      )}

      {role === 'student' && (
        <div className='border-t border-gray-100 pt-4 space-y-2'>
          <p className='text-xs text-center text-gray-400 font-medium'>
            Login as different role
          </p>
          <div className='flex gap-2'>
            <Link
              to='/teacher/login'
              className='flex-1 text-center py-2 rounded-xl border border-gray-200 text-xs text-gray-600 hover:border-green-400 hover:text-green-700 transition-all'
            >
              👨‍🏫 Teacher
            </Link>
            <Link
              to='/admin/login'
              className='flex-1 text-center py-2 rounded-xl border border-gray-200 text-xs text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-all'
            >
              👨‍💼 Admin
            </Link>
          </div>
        </div>
      )}
    </motion.form>
  )
}

export default LoginForm
