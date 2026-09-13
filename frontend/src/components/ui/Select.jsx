import React, { forwardRef } from 'react'

const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      options = [],
      placeholder = 'Select an option',
      fullWidth = true,
      required = false,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className='text-sm font-semibold text-gray-700'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}
      <div className='relative'>
        <select
          ref={ref}
          disabled={disabled}
          className={`
          w-full px-4 py-3 rounded-xl border text-gray-900 text-sm
          focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200
          appearance-none bg-white pr-10
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
          ${
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-gray-200 focus:ring-primary-900'
          }
          ${className}
        `}
          {...props}
        >
          {placeholder && (
            <option value='' disabled>
              {placeholder}
            </option>
          )}
          {options.map(opt => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
          ▾
        </div>
      </div>
      {error && <p className='text-xs text-red-500'>⚠️ {error}</p>}
      {helperText && !error && (
        <p className='text-xs text-gray-500'>{helperText}</p>
      )}
    </div>
  )
)

Select.displayName = 'Select'

export default Select
