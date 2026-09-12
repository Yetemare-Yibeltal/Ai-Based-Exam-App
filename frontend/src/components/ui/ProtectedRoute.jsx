import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import { PageLoader } from './LoadingSpinner'
import { LOGIN_BY_ROLE } from '../../constants/routes'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, isInitialized } = useAuthStore()
  const location = useLocation()

  if (!isInitialized) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    const loginRoute =
      allowedRoles.length > 0
        ? LOGIN_BY_ROLE[allowedRoles[0]] || '/login'
        : '/login'
    return <Navigate to={loginRoute} state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === 'admin') return <Navigate to='/admin/dashboard' replace />
    if (role === 'teacher') return <Navigate to='/teacher/dashboard' replace />
    return <Navigate to='/student/home' replace />
  }

  return children
}

export default ProtectedRoute
