import React from 'react'
import { motion } from 'framer-motion'
import StatCard from '../ui/StatCard'

const StatsOverview = ({ overview, isLoading = false, className = '' }) => {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className='bg-white rounded-2xl border border-gray-100 shadow-card p-6 animate-pulse'
          >
            <div className='w-12 h-12 bg-gray-200 rounded-xl mb-4' />
            <div className='h-8 bg-gray-200 rounded mb-2 w-16' />
            <div className='h-4 bg-gray-100 rounded w-24' />
          </div>
        ))}
      </div>
    )
  }

  if (!overview) return null

  const stats = [
    {
      icon: '👨‍🎓',
      label: 'Total Students',
      value: overview.totalStudents?.toLocaleString() || '0',
      color: 'blue',
      trend: overview.newStudentsThisWeek
    },
    {
      icon: '👨‍🏫',
      label: 'Total Teachers',
      value: overview.totalTeachers?.toLocaleString() || '0',
      color: 'green',
      trend: null
    },
    {
      icon: '❓',
      label: 'Total Questions',
      value: overview.totalQuestions?.toLocaleString() || '0',
      color: 'purple',
      trend: null
    },
    {
      icon: '✅',
      label: 'Approved Questions',
      value: overview.approvedQuestions?.toLocaleString() || '0',
      color: 'green',
      trend: null
    },
    {
      icon: '⏳',
      label: 'Pending Approval',
      value: overview.pendingQuestions?.toLocaleString() || '0',
      color: 'yellow',
      trend: null
    },
    {
      icon: '📝',
      label: 'Total Quizzes',
      value: overview.totalQuizzesTaken?.toLocaleString() || '0',
      color: 'blue',
      trend: null
    },
    {
      icon: '📊',
      label: 'Average Score',
      value: `${overview.averageScore || 0}%`,
      color: 'orange',
      trend: null
    },
    {
      icon: '🤖',
      label: 'AI Generations',
      value: overview.totalAIGenerations?.toLocaleString() || '0',
      color: 'purple',
      trend: null
    }
  ]

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, i) => (
        <StatCard
          key={i}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          color={stat.color}
          trend={stat.trend}
          delay={i * 0.05}
        />
      ))}
    </div>
  )
}

export default StatsOverview
