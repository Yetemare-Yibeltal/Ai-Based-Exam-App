import React from 'react'
import Modal, { ConfirmModal } from './Modal'

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  icon = '⚠️'
}) => (
  <ConfirmModal
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title={`${icon} ${title}`}
    message={message}
    confirmText={confirmText}
    cancelText={cancelText}
    variant={variant}
    isLoading={isLoading}
  />
)

export default ConfirmDialog
