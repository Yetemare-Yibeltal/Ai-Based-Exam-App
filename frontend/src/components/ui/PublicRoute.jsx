import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { PageLoader } from './LoadingSpinner';
import { HOME_BY_ROLE } from '../../constants/routes';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, role, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return <PageLoader />;
  }

  if (isAuthenticated && role) {
    return <Navigate to={HOME_BY_ROLE[role] || '/student/home'} replace />;
  }

  return children;
};

export default PublicRoute;