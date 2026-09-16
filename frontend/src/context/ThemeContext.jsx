import React, { createContext, useContext, useEffect } from 'react'
import useUIStore from '../store/useUIStore'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  const { theme, setTheme, toggleTheme } = useUIStore()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useThemeContext = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider')
  }
  return context
}

export default ThemeContext
