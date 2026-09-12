import React, { forwardRef, useState } from 'react'

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      type = 'text',
      fullWidth = true,
      className = '',
      required = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className='text-sm font-semibold text-gray-700'>
            {label}
            {required && <span className='text-red-500 ml-1'>*</span>}
          </label>
        )}
        <div className='relative'>
          {leftIcon && (
            <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            className={`
            w-full px-4 py-3 rounded-xl border text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
            ${
              error
                ? 'border-red-400 focus:ring-red-400 bg-red-50'
                : 'border-gray-200 focus:ring-primary-900 bg-white'
            }
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon || isPassword ? 'pr-10' : ''}
            ${className}
          `}
            {...props}
          />
          {isPassword && (
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          )}
          {rightIcon && !isPassword && (
            <div className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'>
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className='text-xs text-red-500 flex items-center gap-1'>
            <span>⚠️</span> {error}
          </p>
        )}
        {helperText && !error && (
          <p className='text-xs text-gray-500'>{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
