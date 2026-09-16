import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import AuthLayout from '../../components/auth/AuthLayout'
import Button from '../../components/ui/Button'
import authAPI from '../../api/auth.api'
import useAuthStore from '../../store/useAuthStore'

const VerifyEmail = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, updateUser } = useAuthStore()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handlePaste = e => {
    const pasted = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pasted)) return
    const newOtp = pasted.split('').concat(Array(6).fill('')).slice(0, 6)
    setOtp(newOtp)
    document.getElementById(`otp-5`)?.focus()
  }

  const handleVerify = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }

    setIsLoading(true)
    try {
      const email = user?.email || searchParams.get('email') || ''
      await authAPI.verifyEmail({ email, otp: otpCode })
      updateUser({ isEmailVerified: true })
      toast.success('Email verified successfully! Welcome to HEROY!')
      navigate('/student/home')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP')
      setOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      const email = user?.email || searchParams.get('email') || ''
      await authAPI.resendVerification(email)
      toast.success('Verification code resent to your email')
      setCountdown(60)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout
      title='Verify Your Email 📧'
      subtitle={`We sent a 6-digit code to ${user?.email || 'your email'}`}
      role='student'
      showBackToHome={false}
    >
      <div className='flex flex-col items-center gap-6'>
        <div className='text-6xl'>📨</div>

        <div className='flex gap-3' onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type='text'
              inputMode='numeric'
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all ${
                digit
                  ? 'border-primary-900 bg-primary-50 text-primary-900'
                  : 'border-gray-200 focus:border-primary-900'
              }`}
              autoFocus={i === 0}
            />
          ))}
        </div>

        <Button
          variant='primary'
          size='lg'
          fullWidth
          onClick={handleVerify}
          isLoading={isLoading}
          disabled={otp.join('').length !== 6}
        >
          Verify Email
        </Button>

        <div className='text-center'>
          <p className='text-sm text-gray-500 mb-2'>Didn't receive the code?</p>
          {countdown > 0 ? (
            <p className='text-sm text-gray-400'>Resend in {countdown}s</p>
          ) : (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleResend}
              isLoading={isResending}
            >
              Resend Code
            </Button>
          )}
        </div>

        <button
          onClick={() => navigate('/login')}
          className='text-sm text-gray-400 hover:text-gray-600 transition-colors'
        >
          ← Back to Login
        </button>
      </div>
    </AuthLayout>
  )
}

export default VerifyEmail
