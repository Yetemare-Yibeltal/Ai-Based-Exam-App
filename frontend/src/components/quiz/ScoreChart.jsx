import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { formatShortDate } from '../../utils/formatDate'
import { getSubjectHexColor } from '../../utils/subjectColors'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-3'>
        <p className='text-xs text-gray-500 mb-1'>{label}</p>
        <p className='text-sm font-bold text-primary-900'>
          {payload[0].value}%
        </p>
      </div>
    )
  }
  return null
}

const ScoreChart = ({
  data = [],
  subject = null,
  type = 'line',
  height = 200,
  showGrid = true,
  className = ''
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-48 text-gray-400 text-sm ${className}`}
      >
        No score data available yet
      </div>
    )
  }

  const chartData = data.map(item => ({
    date: formatShortDate(item.createdAt || item.date),
    score: item.percentage || item.score || 0,
    subject: item.subject
  }))

  const color = subject ? getSubjectHexColor(subject) : '#1B3A6B'

  if (type === 'area') {
    return (
      <div className={className}>
        <ResponsiveContainer width='100%' height={height}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id='scoreGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor={color} stopOpacity={0.15} />
                <stop offset='95%' stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            {showGrid && (
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
            )}
            <XAxis
              dataKey='date'
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type='monotone'
              dataKey='score'
              stroke={color}
              strokeWidth={2.5}
              fill='url(#scoreGradient)'
              dot={{ fill: color, r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className={className}>
      <ResponsiveContainer width='100%' height={height}>
        <LineChart data={chartData}>
          {showGrid && <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />}
          <XAxis
            dataKey='date'
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type='monotone'
            dataKey='score'
            stroke={color}
            strokeWidth={2.5}
            dot={{ fill: color, r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ScoreChart
