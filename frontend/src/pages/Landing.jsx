import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '../store/useAuthStore'
import { HOME_BY_ROLE } from '../constants/routes'
import { SUBJECTS } from '../constants/subjects'
import Button from '../components/ui/Button'
import Footer from '../components/layout/Footer'

const Landing = () => {
  const { isAuthenticated, role } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(HOME_BY_ROLE[role], { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  const features = [
    {
      icon: '📝',
      title: '1000+ Real Questions',
      description:
        'Practice with authentic Ethiopian university entrance exam questions from past years.'
    },
    {
      icon: '🤖',
      title: 'AI-Powered Feedback',
      description:
        'Get instant AI explanations and personalized study tips after every quiz.'
    },
    {
      icon: '📊',
      title: 'Progress Tracking',
      description:
        'Monitor your performance across all 6 subjects with detailed analytics.'
    },
    {
      icon: '🏆',
      title: 'National Leaderboard',
      description:
        'Compete with students across Ethiopia and see where you rank.'
    },
    {
      icon: '🔥',
      title: 'Study Streaks',
      description:
        'Build daily study habits and maintain your streak for better results.'
    },
    {
      icon: '📅',
      title: 'Personalized Plan',
      description:
        'Get a customized 90-day study plan based on your performance data.'
    }
  ]

  const stats = [
    { value: '1000+', label: 'Practice Questions' },
    { value: '6', label: 'Subjects Covered' },
    { value: '98%', label: 'Student Satisfaction' },
    { value: '🇪🇹', label: 'Made for Ethiopia' }
  ]

  return (
    <div className='min-h-screen bg-white'>
      {/* Navbar */}
      <nav className='fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center gap-2'>
              <div className='w-9 h-9 bg-primary-900 rounded-xl flex items-center justify-center text-white font-bold text-lg'>
                H
              </div>
              <span className='font-bold text-primary-900 text-xl'>HEROY</span>
            </div>
            <div className='flex items-center gap-3'>
              <Link
                to='/login'
                className='px-4 py-2 text-sm font-semibold text-primary-900 hover:bg-primary-50 rounded-lg transition-colors'
              >
                Login
              </Link>
              <Link
                to='/register'
                className='px-4 py-2 text-sm font-semibold bg-primary-900 text-white rounded-lg hover:bg-primary-800 transition-colors'
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='pt-24 pb-20 bg-gradient-to-br from-primary-900 via-blue-800 to-indigo-900 text-white overflow-hidden'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center max-w-4xl mx-auto'>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className='inline-flex items-center gap-2 bg-white bg-opacity-10 border border-white border-opacity-20 px-4 py-2 rounded-full text-sm font-medium mb-6'>
                <span>🇪🇹</span> The #1 Ethiopian Exam Practice Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className='text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight'
            >
              Ace Your <span className='text-yellow-400'>Ethiopian</span>
              <br />
              University Entrance Exam
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='text-xl text-white text-opacity-85 mb-10 max-w-2xl mx-auto leading-relaxed'
            >
              AI-powered practice platform with 1000+ real exam questions,
              instant feedback, and personalized study plans — completely free
              for Ethiopian students.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className='flex flex-col sm:flex-row items-center justify-center gap-4'
            >
              <Link to='/register'>
                <Button
                  variant='white'
                  size='xl'
                  className='shadow-2xl font-bold'
                >
                  🚀 Start Practicing Free
                </Button>
              </Link>
              <Link to='/login'>
                <Button
                  variant='ghost'
                  size='xl'
                  className='text-white border-2 border-white border-opacity-30 hover:bg-white hover:bg-opacity-10'
                >
                  Already have account? Login
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Floating subject badges */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className='flex flex-wrap justify-center gap-3 mt-16'
          >
            {SUBJECTS.map((subject, i) => (
              <motion.div
                key={subject.id}
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className='flex items-center gap-2 bg-white bg-opacity-10 border border-white border-opacity-20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm'
              >
                <span>{subject.icon}</span>
                <span>{subject.nameEn}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className='py-12 bg-gray-50 border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-8'>
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className='text-center'
              >
                <p className='text-4xl font-black text-primary-900 mb-1'>
                  {stat.value}
                </p>
                <p className='text-gray-500 font-medium text-sm'>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className='py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-black text-gray-900 mb-4'>
              Everything You Need to
              <span className='text-primary-900'> Succeed</span>
            </h2>
            <p className='text-gray-500 text-lg max-w-2xl mx-auto'>
              HEROY combines real exam questions with cutting-edge AI to give
              you the best preparation possible.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className='bg-white rounded-3xl border border-gray-100 shadow-card p-8 transition-all duration-300 hover:shadow-card-hover'
              >
                <div className='w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-3xl mb-5'>
                  {feature.icon}
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-3'>
                  {feature.title}
                </h3>
                <p className='text-gray-500 leading-relaxed'>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-black text-gray-900 mb-4'>
              All 6 Exam Subjects Covered
            </h2>
            <p className='text-gray-500 text-lg'>
              Complete preparation for every subject in the Ethiopian university
              entrance exam
            </p>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4'>
            {SUBJECTS.map((subject, i) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.05 }}
                className={`bg-gradient-to-br ${subject.gradient} rounded-2xl p-5 text-white text-center cursor-pointer shadow-lg`}
              >
                <div className='text-4xl mb-2'>{subject.icon}</div>
                <p className='text-sm font-bold'>{subject.nameEn}</p>
                <p className='text-white text-opacity-70 text-xs mt-1'>
                  {subject.nameAm}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='py-20 bg-gradient-to-r from-primary-900 to-blue-700 text-white'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className='text-4xl sm:text-5xl font-black mb-6'>
              Ready to Achieve Your Dream University? 🎓
            </h2>
            <p className='text-xl text-white text-opacity-85 mb-10'>
              Join thousands of Ethiopian students already preparing with HEROY.
              Start your free practice today!
            </p>
            <Link to='/register'>
              <Button
                variant='white'
                size='xl'
                className='shadow-2xl font-bold text-primary-900'
              >
                🚀 Create Free Account
              </Button>
            </Link>
            <p className='text-white text-opacity-60 text-sm mt-4'>
              No credit card required • 100% free for students
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Landing
