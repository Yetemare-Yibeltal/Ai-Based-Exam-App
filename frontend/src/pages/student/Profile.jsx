import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import StudentLayout from '../../components/layout/StudentLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import AvatarUpload from '../../components/profile/AvatarUpload'
import StatsCard from '../../components/profile/StatsCard'
import SubjectProgress from '../../components/profile/SubjectProgress'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import useAuthStore from '../../store/useAuthStore'
import usersAPI from '../../api/users.api'
import scoresAPI from '../../api/scores.api'
import authAPI from '../../api/auth.api'
import { GRADES } from '../../constants/subjects'

const StudentProfile = () => {
  const { user, updateUser } = useAuthStore()
  const [subjectStats, setSubjectStats] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    grade: user?.grade || 'Grade 12',
    school: user?.school || '',
    phone: user?.phone || ''
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await scoresAPI.getSubjectStats()
        setSubjectStats(res.data.data?.subjects || [])
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const handleFormChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const res = await authAPI.updateProfile(formData)
      updateUser(res.data.data.user)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async formDataObj => {
    setIsUploadingAvatar(true)
    try {
      const res = await usersAPI.uploadStudentAvatar(formDataObj)
      updateUser({ avatar: res.data.data.avatar })
      toast.success('Avatar updated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload avatar')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleDeleteAvatar = async () => {
    try {
      await usersAPI.deleteStudentAvatar()
      updateUser({ avatar: null })
      toast.success('Avatar removed')
    } catch (error) {
      toast.error('Failed to remove avatar')
    }
  }

  const handlePasswordChange = async e => {
    e.preventDefault()
    const errors = {}
    if (!passwordForm.currentPassword)
      errors.currentPassword = 'Current password required'
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters'
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    setIsChangingPassword(true)
    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setPasswordErrors({})
      toast.success('Password changed successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <StudentLayout>
        <div className='flex items-center justify-center min-h-96'>
          <LoadingSpinner size='lg' text='Loading profile...' />
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <PageWrapper title='My Profile'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-2xl border border-gray-100 shadow-card p-6 text-center mb-6'>
              <AvatarUpload
                currentAvatar={user?.avatar}
                userName={user?.name}
                onUpload={handleAvatarUpload}
                onDelete={handleDeleteAvatar}
                isLoading={isUploadingAvatar}
                size='lg'
                className='mb-4'
              />
              <h2 className='text-xl font-bold text-gray-900'>{user?.name}</h2>
              <p className='text-gray-500 text-sm'>{user?.email}</p>
              <div className='flex items-center justify-center gap-2 mt-2'>
                <span className='text-xs bg-primary-50 text-primary-900 px-3 py-1 rounded-full font-semibold'>
                  {user?.grade}
                </span>
                {user?.isEmailVerified && (
                  <span className='text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-semibold'>
                    ✅ Verified
                  </span>
                )}
              </div>
              {user?.studyStreak > 0 && (
                <div className='mt-4 flex items-center justify-center gap-2 bg-orange-50 rounded-2xl py-3'>
                  <span className='text-2xl'>🔥</span>
                  <div>
                    <p className='text-xl font-black text-orange-600'>
                      {user.studyStreak}
                    </p>
                    <p className='text-xs text-orange-500'>day streak</p>
                  </div>
                </div>
              )}
            </div>

            <SubjectProgress subjectStats={subjectStats} />
          </div>

          {/* Right Column */}
          <div className='lg:col-span-2'>
            <StatsCard
              user={user}
              subjectStats={subjectStats}
              className='mb-6'
            />

            {/* Tabs */}
            <div className='bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden'>
              <div className='flex border-b border-gray-100'>
                {[
                  { id: 'profile', label: '👤 Profile Info' },
                  { id: 'security', label: '🔐 Security' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 text-sm font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'text-primary-900 border-b-2 border-primary-900 bg-primary-50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className='p-6'>
                {activeTab === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='flex flex-col gap-4'
                  >
                    <div className='flex justify-end'>
                      {isEditing ? (
                        <div className='flex gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant='primary'
                            size='sm'
                            onClick={handleSaveProfile}
                            isLoading={isSaving}
                          >
                            Save Changes
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setIsEditing(true)}
                        >
                          ✏️ Edit Profile
                        </Button>
                      )}
                    </div>

                    <Input
                      label='Full Name'
                      name='name'
                      value={formData.name}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      leftIcon={<span>👤</span>}
                    />
                    <Input
                      label='Email Address'
                      name='email'
                      type='email'
                      value={formData.email}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      leftIcon={<span>✉️</span>}
                    />
                    <Select
                      label='Grade Level'
                      name='grade'
                      value={formData.grade}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      options={GRADES.map(g => ({
                        value: g.id,
                        label: g.label
                      }))}
                    />
                    <Input
                      label='School'
                      name='school'
                      value={formData.school}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      placeholder='Your school name'
                      leftIcon={<span>🏫</span>}
                    />
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handlePasswordChange}
                    className='flex flex-col gap-4'
                  >
                    <h3 className='text-base font-bold text-gray-900'>
                      Change Password
                    </h3>
                    <Input
                      label='Current Password'
                      type='password'
                      value={passwordForm.currentPassword}
                      onChange={e =>
                        setPasswordForm(p => ({
                          ...p,
                          currentPassword: e.target.value
                        }))
                      }
                      error={passwordErrors.currentPassword}
                      leftIcon={<span>🔒</span>}
                    />
                    <Input
                      label='New Password'
                      type='password'
                      value={passwordForm.newPassword}
                      onChange={e =>
                        setPasswordForm(p => ({
                          ...p,
                          newPassword: e.target.value
                        }))
                      }
                      error={passwordErrors.newPassword}
                      leftIcon={<span>🔒</span>}
                      helperText='Min 8 chars with uppercase, lowercase, number & special character'
                    />
                    <Input
                      label='Confirm New Password'
                      type='password'
                      value={passwordForm.confirmPassword}
                      onChange={e =>
                        setPasswordForm(p => ({
                          ...p,
                          confirmPassword: e.target.value
                        }))
                      }
                      error={passwordErrors.confirmPassword}
                      leftIcon={<span>🔒</span>}
                    />
                    <Button
                      type='submit'
                      variant='primary'
                      isLoading={isChangingPassword}
                      fullWidth
                    >
                      Change Password
                    </Button>
                  </motion.form>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </StudentLayout>
  )
}

export default StudentProfile
