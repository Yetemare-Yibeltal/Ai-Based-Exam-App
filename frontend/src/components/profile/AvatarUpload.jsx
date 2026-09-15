import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import toast from 'react-hot-toast'
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '../../utils/constants'

const AvatarUpload = ({
  currentAvatar,
  userName,
  onUpload,
  onDelete,
  isLoading = false,
  size = 'lg',
  className = ''
}) => {
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)

  const sizes = {
    sm: 'w-16 h-16 text-xl',
    md: 'w-20 h-20 text-2xl',
    lg: 'w-28 h-28 text-4xl',
    xl: 'w-36 h-36 text-5xl'
  }

  const handleFileChange = e => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Please upload a JPG, PNG or WebP image')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image must be smaller than 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target?.result)
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append('avatar', file)
    onUpload(formData)
  }

  const avatarSrc = preview || currentAvatar

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className='relative'>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${sizes[size]} rounded-full border-4 border-white shadow-lg overflow-hidden bg-primary-100 flex items-center justify-center`}
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={userName}
              className='w-full h-full object-cover'
            />
          ) : (
            <span className='font-bold text-primary-900'>
              {userName?.charAt(0)?.toUpperCase() || '?'}
            </span>
          )}
        </motion.div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className='absolute bottom-0 right-0 w-8 h-8 bg-primary-900 text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary-800 transition-colors disabled:opacity-50'
        >
          {isLoading ? (
            <div className='w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin' />
          ) : (
            <span className='text-xs'>📷</span>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept='image/jpeg,image/jpg,image/png,image/webp'
        onChange={handleFileChange}
        className='hidden'
      />

      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => fileInputRef.current?.click()}
          isLoading={isLoading}
          disabled={isLoading}
        >
          Change Photo
        </Button>
        {currentAvatar && onDelete && (
          <Button
            variant='ghost'
            size='sm'
            onClick={onDelete}
            disabled={isLoading}
            className='text-red-500 hover:text-red-600 hover:bg-red-50'
          >
            Remove
          </Button>
        )}
      </div>

      <p className='text-xs text-gray-400 text-center'>
        JPG, PNG or WebP • Max 2MB
      </p>
    </div>
  )
}

export default AvatarUpload
