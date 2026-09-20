import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/layout/AdminLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import UserTable from '../../components/admin/UserTable'
import StatCard from '../../components/ui/StatCard'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Pagination from '../../components/ui/Pagination'
import usersAPI from '../../api/users.api'
import usePagination from '../../hooks/usePagination'
import { SUBJECTS } from '../../constants/subjects'

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    subject: '',
    school: ''
  })
  const [createErrors, setCreateErrors] = useState({})
  const pagination = usePagination({ initialLimit: 20 })

  const fetchTeachers = async () => {
    setIsLoading(true)
    try {
      const [teachersRes, statsRes] = await Promise.all([
        usersAPI.getTeachers({
          page: pagination.page,
          limit: pagination.limit
        }),
        usersAPI.getUserStats()
      ])
      setTeachers(teachersRes.data.data || [])
      pagination.updateTotal(teachersRes.data.pagination?.total || 0)
      setStats(statsRes.data.data?.teachers)
    } catch (error) {
      console.error('Failed to load teachers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [pagination.page])

  const handleCreateTeacher = async e => {
    e.preventDefault()
    const errors = {}
    if (!createForm.name) errors.name = 'Name is required'
    if (!createForm.email || !/^\S+@\S+\.\S+$/.test(createForm.email))
      errors.email = 'Valid email required'
    if (!createForm.subject) errors.subject = 'Subject is required'
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors)
      return
    }

    setIsCreating(true)
    try {
      await usersAPI.createTeacher(createForm)
      toast.success('Teacher account created! Welcome email sent.')
      setShowCreateModal(false)
      setCreateForm({ name: '', email: '', subject: '', school: '' })
      fetchTeachers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create teacher')
    } finally {
      setIsCreating(false)
    }
  }

  const handleApprove = async id => {
    try {
      await usersAPI.approveTeacher(id)
      toast.success('Teacher approved!')
      fetchTeachers()
    } catch (error) {
      toast.error('Failed to approve teacher')
    }
  }

  const handleBan = async (id, reason) => {
    try {
      await usersAPI.banTeacher(id, reason)
      toast.success('Teacher banned')
      fetchTeachers()
    } catch (error) {
      toast.error('Failed to ban teacher')
    }
  }

  const handleUnban = async id => {
    try {
      await usersAPI.unbanTeacher(id)
      toast.success('Teacher unbanned')
      fetchTeachers()
    } catch (error) {
      toast.error('Failed to unban teacher')
    }
  }

  const handleDelete = async id => {
    try {
      await usersAPI.deleteTeacher(id)
      toast.success('Teacher deleted')
      fetchTeachers()
    } catch (error) {
      toast.error('Failed to delete teacher')
    }
  }

  return (
    <AdminLayout>
      <PageWrapper
        title='Manage Teachers'
        subtitle='View, approve and manage teacher accounts'
        actions={
          <Button
            variant='primary'
            size='sm'
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Add Teacher
          </Button>
        }
      >
        {stats && (
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8'>
            <StatCard
              icon='👨‍🏫'
              label='Total Teachers'
              value={stats.total || 0}
              color='green'
              delay={0}
            />
            <StatCard
              icon='✅'
              label='Approved'
              value={stats.approved || 0}
              color='blue'
              delay={0.1}
            />
            <StatCard
              icon='⏳'
              label='Pending'
              value={stats.pending || 0}
              color='yellow'
              delay={0.2}
            />
            <StatCard
              icon='🚫'
              label='Banned'
              value={stats.banned || 0}
              color='red'
              delay={0.3}
            />
          </div>
        )}

        <UserTable
          users={teachers}
          type='teacher'
          isLoading={isLoading}
          onApprove={handleApprove}
          onBan={handleBan}
          onUnban={handleUnban}
          onDelete={handleDelete}
        />

        <div className='mt-4'>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.goToPage}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
            startItem={pagination.startItem}
            endItem={pagination.endItem}
            totalItems={pagination.totalItems}
            getPageNumbers={pagination.getPageNumbers}
          />
        </div>

        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title='Create Teacher Account'
          size='md'
        >
          <form onSubmit={handleCreateTeacher} className='flex flex-col gap-4'>
            <p className='text-sm text-gray-500'>
              A temporary password will be sent to the teacher's email address.
            </p>
            <Input
              label='Full Name'
              value={createForm.name}
              onChange={e =>
                setCreateForm(p => ({ ...p, name: e.target.value }))
              }
              error={createErrors.name}
              required
              leftIcon={<span>👤</span>}
            />
            <Input
              label='Email Address'
              type='email'
              value={createForm.email}
              onChange={e =>
                setCreateForm(p => ({ ...p, email: e.target.value }))
              }
              error={createErrors.email}
              required
              leftIcon={<span>✉️</span>}
            />
            <Select
              label='Subject Specialization'
              value={createForm.subject}
              onChange={e =>
                setCreateForm(p => ({ ...p, subject: e.target.value }))
              }
              error={createErrors.subject}
              placeholder='Select subject'
              required
              options={SUBJECTS.map(s => ({
                value: s.id,
                label: `${s.icon} ${s.nameEn}`
              }))}
            />
            <Input
              label='School (Optional)'
              value={createForm.school}
              onChange={e =>
                setCreateForm(p => ({ ...p, school: e.target.value }))
              }
              leftIcon={<span>🏫</span>}
            />
            <div className='flex gap-3 mt-2'>
              <Button
                type='button'
                variant='ghost'
                fullWidth
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                variant='primary'
                fullWidth
                isLoading={isCreating}
              >
                Create Teacher
              </Button>
            </div>
          </form>
        </Modal>
      </PageWrapper>
    </AdminLayout>
  )
}

export default AdminTeachers
