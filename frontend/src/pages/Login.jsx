import React from 'react'
import AuthLayout from '../../components/auth/AuthLayout'
import LoginForm from '../../components/auth/LoginForm'
import useAuth from '../../hooks/useAuth'

const StudentLogin = () => {
  const { handleLogin, isLoading } = useAuth()

  const onSubmit = (email, password) => {
    handleLogin(email, password, 'student')
  }

  return (
    <AuthLayout
      title='Welcome Back! 👋'
      subtitle='Sign in to continue your exam preparation'
      role='student'
    >
      <LoginForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        role='student'
        registerLink='/register'
        forgotPasswordLink='/forgot-password'
      />
    </AuthLayout>
  )
}

export default StudentLogin
