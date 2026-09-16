import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import useAuthStore from '../store/useAuthStore'
import { HOME_BY_ROLE } from '../constants/routes'

const NotFound = () => {
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuthStore()

  const homeRoute = isAuthenticated && role ? HOME_BY_ROLE[role] : '/'

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className='max-w-md w-full text-center'
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className='text-8xl mb-6'
        >
          😕
        </motion.div>

        <h1 className='text-8xl font-black text-primary-900 mb-4'>404</h1>
        <h2 className='text-2xl font-bold text-gray-800 mb-3'>
          Page Not Found
        </h2>
        <p className='text-gray-500 mb-8 leading-relaxed'>
          The page you are looking for doesn't exist or has been moved. Let's
          get you back on track!
        </p>

        <div className='flex flex-col gap-3'>
          <Button
            variant='primary'
            size='lg'
            fullWidth
            onClick={() => navigate(homeRoute)}
          >
            🏠 Go to Home
          </Button>
          <Button
            variant='outline'
            size='lg'
            fullWidth
            onClick={() => navigate(-1)}
          >
            ← Go Back
          </Button>
        </div>

        <div className='mt-8 pt-8 border-t border-gray-200'>
          <p className='text-sm text-gray-400 mb-3'>Or navigate to:</p>
          <div className='flex flex-wrap justify-center gap-3'>
            <Link
              to='/login'
              className='text-sm text-primary-900 hover:underline font-medium'
            >
              Login
            </Link>
            <Link
              to='/register'
              className='text-sm text-primary-900 hover:underline font-medium'
            >
              Register
            </Link>
            <Link
              to='/'
              className='text-sm text-primary-900 hover:underline font-medium'
            >
              Landing
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFound
