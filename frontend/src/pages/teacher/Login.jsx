import React from 'react'
import AuthLayout from '../../components/auth/AuthLayout'
import LoginForm from '../../components/auth/LoginForm'
import useAuth from '../../hooks/useAuth'

const TeacherLogin = () => {
  const { handleLogin, isLoading } = useAuth()

  const onSubmit = (email, password) => {
    handleLogin(email, password, 'teacher')
  }

  return (
    <AuthLayout
      title='Teacher Portal 👨‍🏫'
      subtitle='Sign in to create and manage exam questions'
      role='teacher'
    >
      <LoginForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        role='teacher'
        forgotPasswordLink='/forgot-password'
      />
    </AuthLayout>
  )
}

export default TeacherLogin
