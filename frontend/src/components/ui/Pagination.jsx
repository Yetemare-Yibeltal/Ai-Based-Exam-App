import React from 'react'
import Button from './Button'

const Pagination = ({
  page,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
  startItem,
  endItem,
  totalItems,
  getPageNumbers
}) => {
  if (totalPages <= 1) return null

  const pages = getPageNumbers ? getPageNumbers() : []

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 py-4'>
      <p className='text-sm text-gray-500'>
        Showing <span className='font-semibold text-gray-700'>{startItem}</span>{' '}
        to <span className='font-semibold text-gray-700'>{endItem}</span> of{' '}
        <span className='font-semibold text-gray-700'>{totalItems}</span>{' '}
        results
      </p>
      <div className='flex items-center gap-1'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className='px-3'
        >
          ← Prev
        </Button>
        {pages.map((p, i) => (
          <button
            key={i}
            onClick={() => typeof p === 'number' && onPageChange(p)}
            disabled={p === '...'}
            className={`
              w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200
              ${
                p === page
                  ? 'bg-primary-900 text-white shadow-md'
                  : p === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            {p}
          </button>
        ))}
        <Button
          variant='ghost'
          size='sm'
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className='px-3'
        >
          Next →
        </Button>
      </div>
    </div>
  )
}

export default Pagination
