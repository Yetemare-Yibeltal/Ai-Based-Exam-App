import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import AuthLayout from '../../components/auth/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import authAPI from '../../api/auth.api'
import { validateEmail } from '../../utils/validateForm'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }

    setIsLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
      toast.success('Reset code sent to your email')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset code')
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout title='Check Your Email 📧' role='student'>
        <div className='text-center flex flex-col items-center gap-6'>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className='text-7xl'
          >
            📨
          </motion.div>
          <div>
            <p className='text-gray-600 mb-1'>
              We sent a password reset code to:
            </p>
            <p className='font-bold text-primary-900'>{email}</p>
          </div>
          <Link to='/reset-password'>
            <Button variant='primary' size='lg' fullWidth>
              Enter Reset Code →
            </Button>
          </Link>
          <button
            onClick={() => setSent(false)}
            className='text-sm text-gray-400 hover:text-gray-600'
          >
            Try different email
          </button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title='Forgot Password? 🔐'
      subtitle="Enter your email and we'll send you a reset code"
      role='student'
    >
      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <Input
          label='Email Address'
          type='email'
          value={email}
          onChange={e => {
            setEmail(e.target.value)
            setError('')
          }}
          placeholder='your@email.com'
          error={error}
          required
          leftIcon={<span>✉️</span>}
          autoFocus
        />
        <Button
          type='submit'
          variant='primary'
          size='lg'
          fullWidth
          isLoading={isLoading}
        >
          Send Reset Code
        </Button>
        <div className='text-center'>
          <Link
            to='/login'
            className='text-sm text-primary-900 hover:underline font-medium'
          >
            ← Back to Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}

export default ForgotPassword
