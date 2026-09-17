import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import TeacherLayout from '../../components/layout/TeacherLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import AvatarUpload from '../../components/profile/AvatarUpload'
import AIQuotaDisplay from '../../components/ai/AIQuotaDisplay'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import useAuthStore from '../../store/useAuthStore'
import teacherAPI from '../../api/teacher.api'
import authAPI from '../../api/auth.api'
import { SUBJECTS } from '../../constants/subjects'

const TeacherProfile = () => {
  const { user, updateUser } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [aiUsage, setAiUsage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: user?.subject || '',
    school: user?.school || '',
    experience: user?.experience || 0,
    qualification: user?.qualification || ''
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [passwordErrors, setPasswordErrors] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, aiRes] = await Promise.all([
          teacherAPI.getStats(),
          teacherAPI.getAIUsage()
        ])
        setStats(statsRes.data.data)
        setAiUsage(aiRes.data.data)
      } catch (error) {
        console.error('Failed to load teacher profile:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleFormChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const res = await teacherAPI.updateProfile(formData)
      updateUser(res.data.data.teacher || res.data.data.user)
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
      const res = await teacherAPI.uploadAvatar(formDataObj)
      updateUser({ avatar: res.data.data.avatar })
      toast.success('Avatar updated!')
    } catch (error) {
      toast.error('Failed to upload avatar')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handlePasswordChange = async e => {
    e.preventDefault()
    const errors = {}
    if (!passwordForm.currentPassword) errors.currentPassword = 'Required'
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      errors.newPassword = 'At least 8 characters'
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
      await authAPI.teacherChangePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      toast.success('Password changed successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <TeacherLayout>
        <div className='flex items-center justify-center min-h-96'>
          <LoadingSpinner size='lg' text='Loading profile...' />
        </div>
      </TeacherLayout>
    )
  }

  return (
    <TeacherLayout>
      <PageWrapper title='My Profile'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-1 flex flex-col gap-4'>
            <div className='bg-white rounded-2xl border border-gray-100 shadow-card p-6 text-center'>
              <AvatarUpload
                currentAvatar={user?.avatar}
                userName={user?.name}
                onUpload={handleAvatarUpload}
                isLoading={isUploadingAvatar}
                size='lg'
                className='mb-4'
              />
              <h2 className='text-xl font-bold text-gray-900'>{user?.name}</h2>
              <p className='text-gray-500 text-sm'>{user?.email}</p>
              <div className='flex items-center justify-center gap-2 mt-2 flex-wrap'>
                <span className='text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-semibold capitalize'>
                  👨‍🏫 {user?.subject}
                </span>
                {user?.isApproved ? (
                  <span className='text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold'>
                    ✅ Approved
                  </span>
                ) : (
                  <span className='text-xs bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-semibold'>
                    ⏳ Pending
                  </span>
                )}
              </div>
            </div>

            {stats && (
              <div className='bg-white rounded-2xl border border-gray-100 shadow-card p-5'>
                <h3 className='font-bold text-gray-900 mb-4'>My Stats</h3>
                <div className='flex flex-col gap-3'>
                  {[
                    {
                      label: 'Total Questions',
                      value: stats.totalQuestionsCreated || 0,
                      icon: '❓'
                    },
                    {
                      label: 'Approved',
                      value: stats.totalQuestionsApproved || 0,
                      icon: '✅'
                    },
                    {
                      label: 'Pending',
                      value: stats.pendingQuestions || 0,
                      icon: '⏳'
                    },
                    {
                      label: 'AI Generated',
                      value: stats.aiGeneratedQuestions || 0,
                      icon: '🤖'
                    }
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className='flex items-center justify-between py-2 border-b border-gray-50 last:border-0'
                    >
                      <div className='flex items-center gap-2'>
                        <span>{stat.icon}</span>
                        <span className='text-sm text-gray-600'>
                          {stat.label}
                        </span>
                      </div>
                      <span className='font-bold text-gray-900'>
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <AIQuotaDisplay
              used={
                aiUsage?.aiGenerationsThisMonth ||
                user?.aiGenerationsThisMonth ||
                0
              }
              limit={100}
            />
          </div>

          <div className='lg:col-span-2'>
            <div className='bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden'>
              <div className='flex border-b border-gray-100'>
                {[
                  { id: 'profile', label: '👤 Profile' },
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
                            Save
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setIsEditing(true)}
                        >
                          ✏️ Edit
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
                      label='Email'
                      name='email'
                      type='email'
                      value={formData.email}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      leftIcon={<span>✉️</span>}
                    />
                    <Select
                      label='Subject Specialization'
                      name='subject'
                      value={formData.subject}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      options={SUBJECTS.map(s => ({
                        value: s.id,
                        label: `${s.icon} ${s.nameEn}`
                      }))}
                    />
                    <Input
                      label='School'
                      name='school'
                      value={formData.school}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      placeholder='Your school'
                      leftIcon={<span>🏫</span>}
                    />
                    <Input
                      label='Years of Experience'
                      name='experience'
                      type='number'
                      value={formData.experience}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      min={0}
                      leftIcon={<span>📅</span>}
                    />
                    <Input
                      label='Qualification'
                      name='qualification'
                      value={formData.qualification}
                      onChange={handleFormChange}
                      disabled={!isEditing}
                      placeholder='e.g. BSc Mathematics'
                      leftIcon={<span>🎓</span>}
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
                    <h3 className='font-bold text-gray-900'>Change Password</h3>
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
    </TeacherLayout>
  )
}

export default TeacherProfile
