import React from 'react'

const Skeleton = ({ className = '', animate = true }) => (
  <div
    className={`bg-gray-200 rounded-lg ${
      animate ? 'animate-pulse' : ''
    } ${className}`}
  />
)

export const SkeletonCard = () => (
  <div className='bg-white rounded-2xl border border-gray-100 p-6 shadow-card'>
    <div className='flex items-start justify-between mb-4'>
      <div className='flex flex-col gap-2 flex-1'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-8 w-16' />
      </div>
      <Skeleton className='w-12 h-12 rounded-xl' />
    </div>
    <Skeleton className='h-3 w-32 mt-2' />
  </div>
)

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden'>
    <div className='bg-gray-50 px-6 py-3 flex gap-4'>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className='h-4 flex-1' />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        className='px-6 py-4 border-t border-gray-100 flex gap-4'
      >
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} className='h-4 flex-1' />
        ))}
      </div>
    ))}
  </div>
)

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
)

export const SkeletonAvatar = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  return <Skeleton className={`${sizes[size]} rounded-full`} />
}

export const SkeletonQuestionCard = () => (
  <div className='bg-white rounded-2xl border border-gray-100 p-6 shadow-card'>
    <Skeleton className='h-5 w-full mb-2' />
    <Skeleton className='h-5 w-3/4 mb-6' />
    <div className='flex flex-col gap-3'>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className='h-14 w-full rounded-xl' />
      ))}
    </div>
  </div>
)

export default Skeleton
