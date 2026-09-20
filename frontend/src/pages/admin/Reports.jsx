import React, { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/layout/AdminLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import SubjectFilter from '../../components/quiz/SubjectFilter'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import adminAPI from '../../api/admin.api'

const AdminReports = () => {
  const [reportType, setReportType] = useState('students')
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    subject: '',
    grade: ''
  })

  const handleGenerateReport = async () => {
    setIsLoading(true)
    setReportData(null)
    try {
      let res
      const params = {
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        subject: filters.subject || undefined,
        grade: filters.grade || undefined
      }

      if (reportType === 'students')
        res = await adminAPI.getStudentReport(params)
      else if (reportType === 'questions')
        res = await adminAPI.getQuestionReport(params)
      else if (reportType === 'performance')
        res = await adminAPI.getPerformanceReport(params)
      else if (reportType === 'ai') res = await adminAPI.getAIReport(params)

      setReportData(res?.data?.data)
      toast.success('Report generated successfully!')
    } catch (error) {
      toast.error('Failed to generate report')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      let res
      if (reportType === 'students') {
        res = await adminAPI.exportStudents(filters)
      } else {
        res = await adminAPI.exportQuestions(filters)
      }

      const blob = new Blob([res.data], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `heroy_${reportType}_report_${
        new Date().toISOString().split('T')[0]
      }.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Report exported successfully!')
    } catch (error) {
      toast.error('Failed to export report')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <AdminLayout>
      <PageWrapper
        title='Reports'
        subtitle='Generate and export platform reports'
      >
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Filters Panel */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-2xl border border-gray-100 shadow-card p-6'>
              <h3 className='font-bold text-gray-900 mb-5'>Report Options</h3>
              <div className='flex flex-col gap-4'>
                <Select
                  label='Report Type'
                  value={reportType}
                  onChange={e => setReportType(e.target.value)}
                  options={[
                    { value: 'students', label: '👨‍🎓 Student Report' },
                    { value: 'questions', label: '❓ Question Report' },
                    { value: 'performance', label: '📊 Performance Report' },
                    { value: 'ai', label: '🤖 AI Usage Report' }
                  ]}
                />

                <Input
                  label='Start Date'
                  type='date'
                  value={filters.startDate}
                  onChange={e =>
                    setFilters(p => ({ ...p, startDate: e.target.value }))
                  }
                />

                <Input
                  label='End Date'
                  type='date'
                  value={filters.endDate}
                  onChange={e =>
                    setFilters(p => ({ ...p, endDate: e.target.value }))
                  }
                />

                {(reportType === 'questions' ||
                  reportType === 'performance') && (
                  <Select
                    label='Subject'
                    value={filters.subject}
                    onChange={e =>
                      setFilters(p => ({ ...p, subject: e.target.value }))
                    }
                    placeholder='All Subjects'
                    options={[
                      { value: 'math', label: '📐 Math' },
                      { value: 'english', label: '📚 English' },
                      { value: 'biology', label: '🔬 Biology' },
                      { value: 'chemistry', label: '⚗️ Chemistry' },
                      { value: 'physics', label: '⚡ Physics' },
                      { value: 'civics', label: '🏛️ Civics' }
                    ]}
                  />
                )}

                {reportType === 'students' && (
                  <Select
                    label='Grade'
                    value={filters.grade}
                    onChange={e =>
                      setFilters(p => ({ ...p, grade: e.target.value }))
                    }
                    placeholder='All Grades'
                    options={[
                      { value: 'Grade 11', label: 'Grade 11' },
                      { value: 'Grade 12', label: 'Grade 12' }
                    ]}
                  />
                )}

                <Button
                  variant='primary'
                  fullWidth
                  onClick={handleGenerateReport}
                  isLoading={isLoading}
                >
                  📊 Generate Report
                </Button>

                {(reportType === 'students' || reportType === 'questions') && (
                  <Button
                    variant='outline'
                    fullWidth
                    onClick={handleExport}
                    isLoading={isExporting}
                  >
                    📥 Export CSV
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Report Results */}
          <div className='lg:col-span-3'>
            {isLoading && (
              <div className='flex items-center justify-center py-20'>
                <LoadingSpinner size='lg' text='Generating report...' />
              </div>
            )}

            {!isLoading && !reportData && (
              <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
                <div className='text-6xl mb-4'>📄</div>
                <p className='text-lg font-semibold text-gray-600 mb-2'>
                  No report generated yet
                </p>
                <p className='text-sm'>
                  Select report type and click "Generate Report"
                </p>
              </div>
            )}

            {reportData && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='flex flex-col gap-6'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-bold text-gray-900 text-lg capitalize'>
                      {reportType} Report
                    </h3>
                    <p className='text-sm text-gray-500'>
                      Generated at{' '}
                      {new Date(reportData.generatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Summary */}
                {reportData.summary && (
                  <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                    {Object.entries(reportData.summary)
                      .slice(0, 8)
                      .map(
                        ([key, value], i) =>
                          typeof value === 'number' && (
                            <div
                              key={i}
                              className='bg-white rounded-2xl border border-gray-100 shadow-card p-4 text-center'
                            >
                              <p className='text-2xl font-black text-gray-900'>
                                {typeof value === 'number'
                                  ? value.toLocaleString()
                                  : value}
                              </p>
                              <p className='text-xs text-gray-500 mt-1 capitalize'>
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </p>
                            </div>
                          )
                      )}
                  </div>
                )}

                {/* Top Performers */}
                {reportData.topPerformers &&
                  reportData.topPerformers.length > 0 && (
                    <div className='bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden'>
                      <div className='p-4 border-b border-gray-100'>
                        <h4 className='font-bold text-gray-900'>
                          Top Performers
                        </h4>
                      </div>
                      <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                          <thead className='bg-gray-50'>
                            <tr>
                              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase'>
                                #
                              </th>
                              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase'>
                                Name
                              </th>
                              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase'>
                                Grade
                              </th>
                              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase'>
                                Avg Score
                              </th>
                              <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase'>
                                Quizzes
                              </th>
                            </tr>
                          </thead>
                          <tbody className='divide-y divide-gray-50'>
                            {reportData.topPerformers
                              .slice(0, 10)
                              .map((student, i) => (
                                <tr key={i} className='hover:bg-gray-50'>
                                  <td className='px-4 py-3 font-bold text-gray-500'>
                                    #{i + 1}
                                  </td>
                                  <td className='px-4 py-3 font-medium text-gray-800'>
                                    {student.name}
                                  </td>
                                  <td className='px-4 py-3 text-gray-600'>
                                    {student.grade}
                                  </td>
                                  <td className='px-4 py-3 font-bold text-primary-900'>
                                    {student.averageScore}%
                                  </td>
                                  <td className='px-4 py-3 text-gray-600'>
                                    {student.totalQuizzes}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {/* Subject Activity */}
                {reportData.subjectActivity &&
                  reportData.subjectActivity.length > 0 && (
                    <div className='bg-white rounded-2xl border border-gray-100 shadow-card p-6'>
                      <h4 className='font-bold text-gray-900 mb-4'>
                        Subject Activity
                      </h4>
                      <div className='flex flex-col gap-3'>
                        {reportData.subjectActivity.map((s, i) => (
                          <div
                            key={i}
                            className='flex items-center justify-between'
                          >
                            <span className='text-sm text-gray-700 capitalize'>
                              {s._id}
                            </span>
                            <div className='flex items-center gap-3'>
                              <span className='text-sm font-bold text-primary-900'>
                                {Math.round(s.avgScore || 0)}%
                              </span>
                              <span className='text-xs text-gray-400'>
                                {s.totalAttempts} attempts
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </motion.div>
            )}
          </div>
        </div>
      </PageWrapper>
    </AdminLayout>
  )
}

export default AdminReports
