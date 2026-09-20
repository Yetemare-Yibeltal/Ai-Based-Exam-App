import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/layout/AdminLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Table from '../../components/ui/Table'
import SubjectFilter from '../../components/quiz/SubjectFilter'
import DifficultyBadge from '../../components/quiz/DifficultyBadge'
import { StatusBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import SearchBar from '../../components/ui/SearchBar'
import StatCard from '../../components/ui/StatCard'
import Select from '../../components/ui/Select'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Pagination from '../../components/ui/Pagination'
import questionsAPI from '../../api/questions.api'
import usePagination from '../../hooks/usePagination'
import { getSubjectIcon } from '../../constants/subjects'
import { formatTimeAgo } from '../../utils/formatDate'
import { useDebounce } from '../../hooks/useDebounce'

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [subjectFilter, setSubjectFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null })
  const [isDeleting, setIsDeleting] = useState(false)
  const debouncedSearch = useDebounce(search, 400)
  const pagination = usePagination({ initialLimit: 20 })

  const fetchQuestions = async () => {
    setIsLoading(true)
    try {
      const [questionsRes, statsRes] = await Promise.all([
        questionsAPI.getAdminQuestions({
          page: pagination.page,
          limit: pagination.limit,
          subject: subjectFilter || undefined,
          status: statusFilter || undefined,
          search: debouncedSearch || undefined
        }),
        questionsAPI.getAdminQuestionStats()
      ])
      setQuestions(questionsRes.data.data || [])
      pagination.updateTotal(questionsRes.data.pagination?.total || 0)
      setStats(statsRes.data.data)
    } catch (error) {
      console.error('Failed to load questions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [pagination.page, subjectFilter, statusFilter, debouncedSearch])

  const handleDelete = async () => {
    if (!deleteDialog.id) return
    setIsDeleting(true)
    try {
      await questionsAPI.deleteAdminQuestion(deleteDialog.id)
      toast.success('Question deleted')
      setDeleteDialog({ isOpen: false, id: null })
      fetchQuestions()
    } catch (error) {
      toast.error('Failed to delete question')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFeature = async id => {
    try {
      await questionsAPI.featureQuestion(id)
      toast.success('Question featured status updated')
      fetchQuestions()
    } catch (error) {
      toast.error('Failed to update feature status')
    }
  }

  const columns = [
    {
      header: 'Question',
      key: 'questionText',
      render: (text, row) => (
        <div className='flex items-center gap-3 max-w-xs'>
          <span className='text-lg flex-shrink-0'>
            {getSubjectIcon(row.subject)}
          </span>
          <div>
            <p className='text-sm font-medium text-gray-800 line-clamp-2'>
              {text}
            </p>
            <p className='text-xs text-gray-400 capitalize'>
              {row.subject} • {formatTimeAgo(row.createdAt)}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Difficulty',
      key: 'difficulty',
      render: val => <DifficultyBadge difficulty={val} size='xs' />
    },
    {
      header: 'Status',
      key: 'status',
      render: val => <StatusBadge status={val} />
    },
    {
      header: 'Used',
      key: 'timesUsed',
      render: val => <span className='text-sm text-gray-600'>{val || 0}x</span>
    },
    {
      header: 'AI',
      key: 'isAIGenerated',
      render: val =>
        val ? (
          <span className='text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold'>
            🤖 AI
          </span>
        ) : (
          <span className='text-xs text-gray-400'>Manual</span>
        )
    },
    {
      header: 'Actions',
      key: 'id',
      render: (val, row) => (
        <div className='flex items-center gap-1'>
          {row.status === 'approved' && (
            <Button
              variant='ghost'
              size='xs'
              onClick={() => handleFeature(row.id || row._id)}
            >
              ⭐
            </Button>
          )}
          <Button
            variant='ghost'
            size='xs'
            onClick={() =>
              setDeleteDialog({ isOpen: true, id: row.id || row._id })
            }
            className='text-red-500'
          >
            🗑️
          </Button>
        </div>
      )
    }
  ]

  return (
    <AdminLayout>
      <PageWrapper
        title='All Questions'
        subtitle='Browse and manage all exam questions'
      >
        {stats && (
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8'>
            <StatCard
              icon='❓'
              label='Total'
              value={stats.status?.total || 0}
              color='blue'
              delay={0}
            />
            <StatCard
              icon='✅'
              label='Approved'
              value={stats.status?.approved || 0}
              color='green'
              delay={0.1}
            />
            <StatCard
              icon='⏳'
              label='Pending'
              value={stats.status?.pending || 0}
              color='yellow'
              delay={0.2}
            />
            <StatCard
              icon='🤖'
              label='AI Generated'
              value={stats.aiVsManual?.aiGenerated || 0}
              color='purple'
              delay={0.3}
            />
          </div>
        )}

        <div className='flex flex-col sm:flex-row gap-3 mb-4'>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder='Search questions...'
            className='flex-1'
          />
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[
              { value: 'approved', label: '✅ Approved' },
              { value: 'pending', label: '⏳ Pending' },
              { value: 'rejected', label: '❌ Rejected' },
              { value: 'draft', label: '📝 Draft' }
            ]}
            placeholder='All Status'
            className='w-44'
          />
        </div>

        <div className='mb-4'>
          <SubjectFilter
            selected={subjectFilter}
            onChange={setSubjectFilter}
            showAll
          />
        </div>

        <Table
          columns={columns}
          data={questions}
          isLoading={isLoading}
          emptyIcon='❓'
          emptyTitle='No questions found'
          emptyMessage='Try adjusting your filters'
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

        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, id: null })}
          onConfirm={handleDelete}
          title='Delete Question'
          message='Are you sure you want to permanently delete this question?'
          confirmText='Delete'
          variant='danger'
          isLoading={isDeleting}
        />
      </PageWrapper>
    </AdminLayout>
  )
}

export default AdminQuestions
