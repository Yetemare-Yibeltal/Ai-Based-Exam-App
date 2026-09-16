import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthLayout from '../../components/auth/AuthLayout'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import authAPI from '../../api/auth.api'
import { validatePassword } from '../../utils/validateForm'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.otp || formData.otp.length !== 6)
      newErrors.otp = 'Enter the 6-digit code'
    const passError = validatePassword(formData.password)
    if (passError) newErrors.password = passError
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      await authAPI.resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.password
      })
      toast.success('Password reset successfully! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title='Reset Password 🔐'
      subtitle='Enter the code from your email and your new password'
      role='student'
    >
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
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
        />
        <Input
          label='Reset Code (6 digits)'
          name='otp'
          type='text'
          value={formData.otp}
          onChange={handleChange}
          placeholder='123456'
          error={errors.otp}
          required
          maxLength={6}
          leftIcon={<span>🔢</span>}
        />
        <Input
          label='New Password'
          name='password'
          type='password'
          value={formData.password}
          onChange={handleChange}
          placeholder='Min. 8 characters'
          error={errors.password}
          required
          leftIcon={<span>🔒</span>}
        />
        <Input
          label='Confirm New Password'
          name='confirmPassword'
          type='password'
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder='Confirm password'
          error={errors.confirmPassword}
          required
          leftIcon={<span>🔒</span>}
        />
        <Button
          type='submit'
          variant='primary'
          size='lg'
          fullWidth
          isLoading={isLoading}
          className='mt-2'
        >
          Reset Password
        </Button>
      </form>
    </AuthLayout>
  )
}

export default ResetPassword
