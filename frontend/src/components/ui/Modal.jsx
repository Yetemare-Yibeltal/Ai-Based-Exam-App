import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  footer = null,
  className = ''
}) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col ${className}`}
          >
            {(title || showCloseButton) && (
              <div className='flex items-center justify-between p-6 border-b border-gray-100'>
                {title && (
                  <h2 className='text-xl font-bold text-gray-900'>{title}</h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className='w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all'
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
            <div className='flex-1 overflow-y-auto p-6'>{children}</div>
            {footer && (
              <div className='p-6 border-t border-gray-100'>{footer}</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size='sm'>
    <div className='flex flex-col gap-6'>
      <p className='text-gray-600'>{message}</p>
      <div className='flex items-center gap-3 justify-end'>
        <Button variant='ghost' onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
          {confirmText}
        </Button>
      </div>
    </div>
  </Modal>
)

export default Modal
