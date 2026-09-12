import React from 'react'
import { motion } from 'framer-motion'

const sizes = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
}

const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  text = null,
  fullScreen = false,
  overlay = false
}) => {
  const colorClass =
    {
      primary: 'border-primary-900',
      white: 'border-white',
      gray: 'border-gray-400',
      green: 'border-green-600'
    }[color] || 'border-primary-900'

  const spinner = (
    <div className='flex flex-col items-center justify-center gap-3'>
      <div
        className={`${sizes[size]} border-4 border-gray-200 ${colorClass} border-t-transparent rounded-full animate-spin`}
      />
      {text && (
        <p
          className={`text-sm font-medium ${
            color === 'white' ? 'text-white' : 'text-gray-500'
          }`}
        >
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className='fixed inset-0 bg-white z-50 flex items-center justify-center'>
        {spinner}
      </div>
    )
  }

  if (overlay) {
    return (
      <div className='absolute inset-0 bg-white bg-opacity-80 z-10 flex items-center justify-center rounded-2xl'>
        {spinner}
      </div>
    )
  }

  return spinner
}

export const PageLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className='min-h-screen flex items-center justify-center bg-gray-50'
  >
    <div className='flex flex-col items-center gap-4'>
      <div className='w-16 h-16 border-4 border-gray-200 border-t-primary-900 rounded-full animate-spin' />
      <p className='text-gray-500 font-medium animate-pulse'>
        Loading HEROY...
      </p>
    </div>
  </motion.div>
)

export const InlineLoader = ({ text = 'Loading...' }) => (
  <div className='flex items-center gap-2 text-gray-500'>
    <div className='w-4 h-4 border-2 border-gray-300 border-t-primary-900 rounded-full animate-spin' />
    <span className='text-sm'>{text}</span>
  </div>
)

export const ButtonLoader = () => (
  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
)

export default LoadingSpinner
