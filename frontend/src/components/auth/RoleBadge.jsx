import React from 'react'
import {
  getRoleIcon,
  getRoleBadgeColor,
  getRoleLabel
} from '../../utils/roleHelpers'

const RoleBadge = ({ role, size = 'sm', showIcon = true, className = '' }) => {
  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-semibold rounded-full
        ${getRoleBadgeColor(role)}
        ${sizes[size] || sizes.sm}
        ${className}
      `}
    >
      {showIcon && <span>{getRoleIcon(role)}</span>}
      <span className='capitalize'>{getRoleLabel(role)}</span>
    </span>
  )
}

export default RoleBadge
