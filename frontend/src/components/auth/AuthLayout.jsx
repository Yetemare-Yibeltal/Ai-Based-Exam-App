import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const AuthLayout = ({
  children,
  title,
  subtitle,
  role = 'student',
  showBackToHome = true
}) => {
  const roleConfig = {
    student: {
      gradient: 'from-primary-900 via-blue-800 to-indigo-900',
      icon: '🎓',
      tagline: 'Prepare for your Ethiopian University Entrance Exam',
      features: [
        '📝 1000+ real exam questions',
        '🤖 AI-powered study tips',
        '📊 Track your progress',
        '🏆 National leaderboard'
      ]
    },
    teacher: {
      gradient: 'from-green-900 via-green-800 to-teal-900',
      icon: '👨‍🏫',
      tagline: 'Help Ethiopian students prepare for their future',
      features: [
        '✍️ Create quality questions',
        '🤖 AI question generation',
        '📈 Performance analytics',
        '✅ Question approval workflow'
      ]
    },
    admin: {
      gradient: 'from-gray-900 via-gray-800 to-slate-900',
      icon: '👨‍💼',
      tagline: 'Manage the HEROY platform',
      features: [
        '👥 Manage all users',
        '✅ Approve questions',
        '📊 Platform analytics',
        '⚙️ System settings'
      ]
    }
  }

  const config = roleConfig[role] || roleConfig.student

  return (
    <div className='min-h-screen flex'>
      {/* Left panel */}
      <div
        className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br ${config.gradient} flex-col justify-between p-12 text-white`}
      >
        <div>
          <Link to='/' className='flex items-center gap-3 mb-16'>
            <div className='w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center font-bold text-xl'>
              H
            </div>
            <span className='text-2xl font-bold'>HEROY</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className='text-6xl mb-6'>{config.icon}</div>
            <h2 className='text-4xl font-bold mb-4 leading-tight'>
              Welcome to
              <br />
              HEROY Platform
            </h2>
            <p className='text-white text-opacity-80 text-lg mb-12'>
              {config.tagline}
            </p>

            <div className='flex flex-col gap-4'>
              {config.features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                  className='flex items-center gap-3 text-white text-opacity-90'
                >
                  <div className='w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-sm'>
                    ✓
                  </div>
                  <span className='text-base'>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className='text-white text-opacity-60 text-sm'>
          <p>🇪🇹 Built for Ethiopian Students</p>
          <p className='mt-1'>
            © {new Date().getFullYear()} HEROY. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className='flex-1 flex items-center justify-center bg-gray-50 p-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='w-full max-w-md'
        >
          {/* Mobile logo */}
          <div className='lg:hidden flex items-center justify-center gap-2 mb-8'>
            <div className='w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center text-white font-bold text-xl'>
              H
            </div>
            <span className='text-2xl font-bold text-primary-900'>HEROY</span>
          </div>

          <div className='bg-white rounded-3xl shadow-xl border border-gray-100 p-8'>
            <div className='mb-8'>
              <h1 className='text-2xl font-bold text-gray-900'>{title}</h1>
              {subtitle && (
                <p className='text-gray-500 mt-2 text-sm'>{subtitle}</p>
              )}
            </div>

            {children}
          </div>

          {showBackToHome && (
            <p className='text-center text-sm text-gray-500 mt-6'>
              <Link
                to='/'
                className='text-primary-900 font-semibold hover:underline'
              >
                ← Back to Home
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default AuthLayout
