import React from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';
import useAuth from '../../hooks/useAuth';

const AdminLogin = () => {
  const { handleLogin, isLoading } = useAuth();

  const onSubmit = (email, password) => {
    handleLogin(email, password, 'admin');
  };

  return (
    <AuthLayout
      title="Admin Portal 👨‍💼"
      subtitle="Sign in to manage the HEROY platform"
      role="admin"
    >
      <LoginForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        role="admin"
        forgotPasswordLink="/forgot-password"
      />
    </AuthLayout>
  );
};

export default AdminLogin;