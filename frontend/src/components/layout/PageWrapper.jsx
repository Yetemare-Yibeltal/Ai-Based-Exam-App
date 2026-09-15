import React from 'react'
import { motion } from 'framer-motion'

const PageWrapper = ({
  children,
  title = null,
  subtitle = null,
  actions = null,
  className = '',
  animate = true
}) => {
  const content = (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {(title || actions) && (
        <div className='bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-6'>
          <div className='max-w-7xl mx-auto flex items-start justify-between gap-4'>
            <div>
              {title && (
                <h1 className='text-2xl font-bold text-gray-900'>{title}</h1>
              )}
              {subtitle && (
                <p className='text-gray-500 text-sm mt-1'>{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className='flex items-center gap-3 flex-shrink-0'>
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {children}
      </main>
    </div>
  )

  if (!animate) return content

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {content}
    </motion.div>
  )
}

export default PageWrapper
