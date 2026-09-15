import React from 'react'
import { motion } from 'framer-motion'
import { SUBJECTS } from '../../constants/subjects'

const SubjectFilter = ({
  selected = '',
  onChange,
  showAll = true,
  className = ''
}) => (
  <div className={`flex flex-wrap gap-2 ${className}`}>
    {showAll && (
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onChange('')}
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
          selected === ''
            ? 'bg-primary-900 text-white shadow-sm'
            : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-900 hover:text-primary-900'
        }`}
      >
        All Subjects
      </motion.button>
    )}
    {SUBJECTS.map(subject => (
      <motion.button
        key={subject.id}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onChange(subject.id)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
          selected === subject.id
            ? 'text-white shadow-sm'
            : 'bg-white border border-gray-200 text-gray-600 hover:border-current'
        }`}
        style={
          selected === subject.id ? { backgroundColor: subject.color } : {}
        }
      >
        <span>{subject.icon}</span>
        <span className='hidden sm:inline'>{subject.nameEn}</span>
      </motion.button>
    ))}
  </div>
)

export default SubjectFilter
