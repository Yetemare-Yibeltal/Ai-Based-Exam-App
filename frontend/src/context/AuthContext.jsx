import React, { createContext, useContext, useEffect } from 'react'
import useAuthStore from '../store/useAuthStore'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const authStore = useAuthStore()

  useEffect(() => {
    authStore.checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={authStore}>{children}</AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}

export default AuthContext
