import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import { PageLoader } from '../ui/LoadingSpinner'
import { HOME_BY_ROLE } from '../../constants/routes'

const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, isInitialized } = useAuthStore()

  if (!isInitialized) return <PageLoader />

  if (!isAuthenticated) return <Navigate to='/login' replace />

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={HOME_BY_ROLE[role] || '/login'} replace />
  }

  return children
}

export default RoleRoute
