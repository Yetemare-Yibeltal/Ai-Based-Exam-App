import React from 'react'
import { motion } from 'framer-motion'

const OptionButton = ({
  index,
  text,
  isSelected = false,
  isCorrect = false,
  isWrong = false,
  onClick,
  disabled = false
}) => {
  const labels = ['A', 'B', 'C', 'D']
  const label = labels[index] || String.fromCharCode(65 + index)

  const getStyles = () => {
    if (isCorrect) {
      return {
        container: 'border-green-500 bg-green-50 shadow-sm',
        label: 'bg-green-500 text-white',
        text: 'text-green-800 font-semibold',
        icon: '✓'
      }
    }
    if (isWrong) {
      return {
        container: 'border-red-400 bg-red-50',
        label: 'bg-red-400 text-white',
        text: 'text-red-700',
        icon: '✗'
      }
    }
    if (isSelected) {
      return {
        container: 'border-primary-900 bg-primary-50 shadow-sm',
        label: 'bg-primary-900 text-white',
        text: 'text-primary-900 font-semibold',
        icon: null
      }
    }
    return {
      container:
        'border-gray-200 bg-white hover:border-primary-300 hover:bg-blue-50',
      label:
        'bg-gray-100 text-gray-600 group-hover:bg-primary-100 group-hover:text-primary-900',
      text: 'text-gray-700',
      icon: null
    }
  }

  const styles = getStyles()

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        group w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2
        transition-all duration-200 text-left
        disabled:cursor-not-allowed
        ${styles.container}
      `}
    >
      <div
        className={`
        w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm
        flex-shrink-0 transition-all duration-200
        ${styles.label}
      `}
      >
        {styles.icon || label}
      </div>
      <span
        className={`flex-1 text-sm sm:text-base leading-relaxed ${styles.text}`}
      >
        {text}
      </span>
    </motion.button>
  )
}

export default OptionButton
