import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/layout/AdminLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import adminAPI from '../../api/admin.api'

const AdminSettings = () => {
  const [settings, setSettings] = useState(null)
  const [systemInfo, setSystemInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isClearingCache, setIsClearingCache] = useState(false)
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false)
  const [announcementText, setAnnouncementText] = useState('')
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false)
  const [formData, setFormData] = useState({
    quizTimePerQuestion: 30,
    maxQuestionsPerQuiz: 50,
    maxAIGenerationsPerMonth: 100,
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, systemRes] = await Promise.all([
          adminAPI.getSettings(),
          adminAPI.getSystemInfo()
        ])
        const s = settingsRes.data.data?.settings || {}
        setSettings(s)
        setSystemInfo(systemRes.data.data)
        setFormData(prev => ({ ...prev, ...s }))
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      await adminAPI.updateSettings(formData)
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClearCache = async () => {
    setIsClearingCache(true)
    try {
      await adminAPI.clearCache()
      toast.success('Cache cleared successfully!')
      setShowClearCacheDialog(false)
    } catch (error) {
      toast.error('Failed to clear cache')
    } finally {
      setIsClearingCache(false)
    }
  }

  const handleSendAnnouncement = async () => {
    if (!announcementText.trim()) {
      toast.error('Please enter announcement text')
      return
    }
    setIsSendingAnnouncement(true)
    try {
      await adminAPI.sendAnnouncement({
        title: 'Platform Announcement',
        message: announcementText,
        targetRole: 'all',
        priority: 'high'
      })
      toast.success('Announcement sent to all users!')
      setAnnouncementText('')
    } catch (error) {
      toast.error('Failed to send announcement')
    } finally {
      setIsSendingAnnouncement(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className='flex items-center justify-center min-h-96'>
          <LoadingSpinner size='lg' text='Loading settings...' />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <PageWrapper
        title='Settings'
        subtitle='Configure platform settings and preferences'
      >
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Quiz Settings */}
          <div className='bg-white rounded-2xl border border-gray-100 shadow-card p-6'>
            <h3 className='font-bold text-gray-900 mb-5 flex items-center gap-2'>
              📝 Quiz Settings
            </h3>
            <div className='flex flex-col gap-4'>
              <Input
                label='Time Per Question (seconds)'
                type='number'
                value={formData.quizTimePerQuestion}
                onChange={e =>
                  setFormData(p => ({
                    ...p,
                    quizTimePerQuestion: parseInt(e.target.value)
                  }))
                }
                min={10}
                max={120}
              />
              <Input
                label='Max Questions Per Quiz'
                type='number'
                value={formData.maxQuestionsPerQuiz}
                onChange={e =>
                  setFormData(p => ({
                    ...p,
                    maxQuestionsPerQuiz: parseInt(e.target.value)
                  }))
                }
                min={5}
                max={100}
              />
              <Input
                label='Max AI Generations Per Teacher/Month'
                type='number'
                value={formData.maxAIGenerationsPerMonth}
                onChange={e =>
                  setFormData(p => ({
                    ...p,
                    maxAIGenerationsPerMonth: parseInt(e.target.value)
                  }))
                }
                min={10}
                max={500}
              />
            </div>
          </div>

          {/* Platform Settings */}
          <div className='bg-white rounded-2xl border border-gray-100 shadow-card p-6'>
            <h3 className='font-bold text-gray-900 mb-5 flex items-center gap-2'>
              ⚙️ Platform Settings
            </h3>
            <div className='flex flex-col gap-4'>
              {[
                {
                  key: 'maintenanceMode',
                  label: 'Maintenance Mode',
                  desc: 'Temporarily disable the platform for users'
                },
                {
                  key: 'registrationEnabled',
                  label: 'Allow New Registrations',
                  desc: 'Allow new students to register'
                },
                {
                  key: 'emailVerificationRequired',
                  label: 'Require Email Verification',
                  desc: 'Students must verify email before quizzes'
                }
              ].map(setting => (
                <div
                  key={setting.key}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-xl'
                >
                  <div>
                    <p className='text-sm font-semibold text-gray-800'>
                      {setting.label}
                    </p>
                    <p className='text-xs text-gray-500'>{setting.desc}</p>
                  </div>
                  <button
                    onClick={() =>
                      setFormData(p => ({
                        ...p,
                        [setting.key]: !p[setting.key]
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      formData[setting.key] ? 'bg-primary-900' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                        formData[setting.key]
                          ? 'translate-x-5'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}

              <Button
                variant='primary'
                fullWidth
                onClick={handleSaveSettings}
                isLoading={isSaving}
              >
                Save Settings
              </Button>
            </div>
          </div>

          {/* Send Announcement */}
          <div className='bg-white rounded-2xl border border-gray-100 shadow-card p-6'>
            <h3 className='font-bold text-gray-900 mb-5 flex items-center gap-2'>
              📢 Send Announcement
            </h3>
            <div className='flex flex-col gap-4'>
              <div>
                <label className='label'>Announcement Message</label>
                <textarea
                  value={announcementText}
                  onChange={e => setAnnouncementText(e.target.value)}
                  placeholder='Type your announcement for all users...'
                  rows={4}
                  className='input resize-none'
                />
              </div>
              <Button
                variant='primary'
                fullWidth
                onClick={handleSendAnnouncement}
                isLoading={isSendingAnnouncement}
                disabled={!announcementText.trim()}
              >
                📢 Send to All Users
              </Button>
            </div>
          </div>

          {/* System Info & Cache */}
          <div className='bg-white rounded-2xl border border-gray-100 shadow-card p-6'>
            <h3 className='font-bold text-gray-900 mb-5 flex items-center gap-2'>
              🖥️ System Info
            </h3>
            {systemInfo && (
              <div className='flex flex-col gap-2 mb-6'>
                {[
                  {
                    label: 'Node.js Version',
                    value: systemInfo.nodeVersion || 'N/A'
                  },
                  {
                    label: 'Environment',
                    value: systemInfo.environment || 'development'
                  },
                  { label: 'Uptime', value: systemInfo.uptime || 'N/A' },
                  {
                    label: 'Memory Usage',
                    value: systemInfo.memoryUsage || 'N/A'
                  },
                  {
                    label: 'Cache Entries',
                    value: systemInfo.cacheStats?.active || 0
                  },
                  {
                    label: 'Database',
                    value: systemInfo.dbStatus || 'Connected'
                  }
                ].map((item, i) => (
                  <div
                    key={i}
                    className='flex items-center justify-between py-2 border-b border-gray-50 last:border-0'
                  >
                    <span className='text-sm text-gray-500'>{item.label}</span>
                    <span className='text-sm font-semibold text-gray-800'>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant='danger'
              fullWidth
              onClick={() => setShowClearCacheDialog(true)}
              isLoading={isClearingCache}
            >
              🗑️ Clear Cache
            </Button>
          </div>
        </div>

        <ConfirmDialog
          isOpen={showClearCacheDialog}
          onClose={() => setShowClearCacheDialog(false)}
          onConfirm={handleClearCache}
          title='Clear Cache'
          message='Are you sure you want to clear the platform cache? This may temporarily slow down responses.'
          confirmText='Clear Cache'
          variant='warning'
          isLoading={isClearingCache}
          icon='🗑️'
        />
      </PageWrapper>
    </AdminLayout>
  )
}

export default AdminSettings
