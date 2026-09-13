import React, { useRef } from 'react'
import { useDebounce } from '../../hooks/useDebounce'

const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  className = '',
  autoFocus = false,
  debounceDelay = 300
}) => {
  const inputRef = useRef(null)

  const handleChange = e => {
    onChange(e.target.value)
  }

  const handleClear = () => {
    onChange('')
    if (onSearch) onSearch('')
    inputRef.current?.focus()
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg'>
        🔍
      </div>
      <input
        ref={inputRef}
        type='text'
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className='w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent transition-all duration-200'
      />
      {value && (
        <button
          onClick={handleClear}
          className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default SearchBar
