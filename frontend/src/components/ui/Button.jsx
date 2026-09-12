import React from 'react'
import { motion } from 'framer-motion'
import { ButtonLoader } from './LoadingSpinner'

const variants = {
  primary:
    'bg-primary-900 text-white hover:bg-primary-800 focus:ring-primary-900',
  secondary:
    'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-600',
  outline:
    'border-2 border-primary-900 text-primary-900 hover:bg-primary-900 hover:text-white focus:ring-primary-900',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
  ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-300',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-600',
  warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
  white:
    'bg-white text-primary-900 hover:bg-gray-100 focus:ring-white shadow-md'
}

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg'
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClass = `
    inline-flex items-center justify-center gap-2 font-semibold rounded-xl
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim()

  return (
    <motion.button
      type={type}
      className={baseClass}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      {...props}
    >
      {isLoading ? (
        <>
          <ButtonLoader />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className='flex-shrink-0'>{leftIcon}</span>}
          {children}
          {rightIcon && <span className='flex-shrink-0'>{rightIcon}</span>}
        </>
      )}
    </motion.button>
  )
}

export default Button
