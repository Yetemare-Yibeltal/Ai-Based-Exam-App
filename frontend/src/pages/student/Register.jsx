import React from 'react'
import AuthLayout from '../../components/auth/AuthLayout'
import RegisterForm from '../../components/auth/RegisterForm'
import useAuth from '../../hooks/useAuth'

const StudentRegister = () => {
  const { handleRegister, isLoading } = useAuth()

  return (
    <AuthLayout
      title='Create Your Account 🎓'
      subtitle='Join thousands of Ethiopian students preparing for their exams'
      role='student'
    >
      <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
    </AuthLayout>
  )
}

export default StudentRegister
