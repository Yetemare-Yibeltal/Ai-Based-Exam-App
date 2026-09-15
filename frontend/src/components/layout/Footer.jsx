import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => (
  <footer className='bg-white border-t border-gray-100 mt-auto'>
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
        <div className='flex items-center gap-2'>
          <div className='w-7 h-7 bg-primary-900 rounded-lg flex items-center justify-center text-white font-bold text-sm'>
            H
          </div>
          <span className='font-bold text-primary-900'>HEROY</span>
          <span className='text-gray-400 text-sm'>
            — Ethiopian Exam Practice
          </span>
        </div>

        <div className='flex items-center gap-6 text-sm text-gray-500'>
          <Link to='/' className='hover:text-primary-900 transition-colors'>
            Home
          </Link>
          <Link
            to='/login'
            className='hover:text-primary-900 transition-colors'
          >
            Login
          </Link>
          <Link
            to='/register'
            className='hover:text-primary-900 transition-colors'
          >
            Register
          </Link>
          <a
            href='mailto:support@heroy.com'
            className='hover:text-primary-900 transition-colors'
          >
            Support
          </a>
        </div>

        <div className='flex items-center gap-2 text-sm text-gray-400'>
          <span>🇪🇹</span>
          <span>
            © {new Date().getFullYear()} HEROY. Built for Ethiopian Students.
          </span>
        </div>
      </div>
    </div>
  </footer>
)

export default Footer
