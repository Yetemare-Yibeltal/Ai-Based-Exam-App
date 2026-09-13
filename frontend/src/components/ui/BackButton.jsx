import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const BackButton = ({ to = null, label = 'Back', className = '' }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }

  return (
    <motion.button
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`flex items-center gap-2 text-gray-500 hover:text-primary-900 font-medium text-sm transition-colors duration-200 ${className}`}
    >
      <span>←</span>
      <span>{label}</span>
    </motion.button>
  )
}

export default BackButton
