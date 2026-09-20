import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/layout/AdminLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import UserTable from '../../components/admin/UserTable'
import StatCard from '../../components/ui/StatCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import usersAPI from '../../api/users.api'
import usePagination from '../../hooks/usePagination'
import Pagination from '../../components/ui/Pagination'

const AdminStudents = () => {
  const [students, setStudents] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const pagination = usePagination({ initialLimit: 20 })

  const fetchStudents = async (params = {}) => {
    setIsLoading(true)
    try {
      const [studentsRes, statsRes] = await Promise.all([
        usersAPI.getStudents({
          page: pagination.page,
          limit: pagination.limit,
          search: search || undefined,
          ...params
        }),
        usersAPI.getUserStats()
      ])
      setStudents(studentsRes.data.data || [])
      pagination.updateTotal(studentsRes.data.pagination?.total || 0)
      setStats(statsRes.data.data?.students)
    } catch (error) {
      console.error('Failed to load students:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [pagination.page, search])

  const handleBan = async (id, reason) => {
    try {
      await usersAPI.banStudent(id, reason)
      toast.success('Student banned successfully')
      fetchStudents()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to ban student')
    }
  }

  const handleUnban = async id => {
    try {
      await usersAPI.unbanStudent(id)
      toast.success('Student unbanned successfully')
      fetchStudents()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unban student')
    }
  }

  const handleDelete = async id => {
    try {
      await usersAPI.deleteStudent(id)
      toast.success('Student deleted')
      fetchStudents()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete student')
    }
  }

  return (
    <AdminLayout>
      <PageWrapper
        title='Manage Students'
        subtitle='View and manage all registered students'
      >
        {stats && (
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8'>
            <StatCard
              icon='👨‍🎓'
              label='Total Students'
              value={stats.total || 0}
              color='blue'
              delay={0}
            />
            <StatCard
              icon='✅'
              label='Active'
              value={stats.active || 0}
              color='green'
              delay={0.1}
            />
            <StatCard
              icon='🚫'
              label='Banned'
              value={stats.banned || 0}
              color='red'
              delay={0.2}
            />
            <StatCard
              icon='📊'
              label='Avg Score'
              value={`${stats.avgScore || 0}%`}
              color='purple'
              delay={0.3}
            />
          </div>
        )}

        <UserTable
          users={students}
          type='student'
          isLoading={isLoading}
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
      </PageWrapper>
    </AdminLayout>
  )
}

export default AdminStudents
