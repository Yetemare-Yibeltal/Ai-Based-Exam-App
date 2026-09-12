import React from 'react'

const variants = {
  primary: 'bg-primary-100 text-primary-900',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
  orange: 'bg-orange-100 text-orange-800',
  cyan: 'bg-cyan-100 text-cyan-800'
}

const sizes = {
  xs: 'px-2 py-0.5 text-xs',
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-sm'
}

const Badge = ({
  children,
  variant = 'gray',
  size = 'sm',
  dot = false,
  icon = null,
  className = ''
}) => (
  <span
    className={`
      inline-flex items-center gap-1.5 font-semibold rounded-full
      ${variants[variant] || variants.gray}
      ${sizes[size] || sizes.sm}
      ${className}
    `}
  >
    {dot && (
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success'
            ? 'bg-green-500'
            : variant === 'danger'
            ? 'bg-red-500'
            : variant === 'warning'
            ? 'bg-yellow-500'
            : 'bg-current'
        }`}
      />
    )}
    {icon && <span>{icon}</span>}
    {children}
  </span>
)

export const StatusBadge = ({ status }) => {
  const config = {
    approved: { variant: 'success', label: 'Approved', icon: '✅' },
    pending: { variant: 'warning', label: 'Pending', icon: '⏳' },
    rejected: { variant: 'danger', label: 'Rejected', icon: '❌' },
    draft: { variant: 'gray', label: 'Draft', icon: '📝' },
    active: { variant: 'success', label: 'Active', icon: '🟢' },
    inactive: { variant: 'gray', label: 'Inactive', icon: '⚫' },
    banned: { variant: 'danger', label: 'Banned', icon: '🚫' },
    verified: { variant: 'success', label: 'Verified', icon: '✓' },
    unverified: { variant: 'warning', label: 'Unverified', icon: '!' }
  }

  const { variant, label, icon } = config[status] || config.draft

  return (
    <Badge variant={variant} icon={icon}>
      {label}
    </Badge>
  )
}

export const GradeBadge = ({ grade }) => {
  const variants = {
    'A+': 'bg-emerald-100 text-emerald-700',
    A: 'bg-green-100 text-green-700',
    'B+': 'bg-blue-100 text-blue-700',
    B: 'bg-blue-50 text-blue-600',
    'C+': 'bg-yellow-100 text-yellow-700',
    C: 'bg-yellow-50 text-yellow-600',
    D: 'bg-orange-100 text-orange-700',
    F: 'bg-red-100 text-red-700'
  }

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
        variants[grade] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {grade}
    </span>
  )
}

export default Badge
