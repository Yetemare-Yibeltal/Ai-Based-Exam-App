import React from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-3'>
        <p className='text-xs text-gray-500 mb-2 font-semibold'>{label}</p>
        {payload.map((entry, i) => (
          <p
            key={i}
            className='text-xs font-semibold'
            style={{ color: entry.color }}
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const AnalyticsChart = ({
  data = [],
  type = 'area',
  title,
  dataKeys = [{ key: 'value', name: 'Value', color: '#1B3A6B' }],
  height = 250,
  className = ''
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${className}`}
      >
        {title && (
          <h3 className='text-base font-bold text-gray-900 mb-4'>{title}</h3>
        )}
        <div className='flex items-center justify-center h-48 text-gray-400 text-sm'>
          No data available
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${className}`}
    >
      {title && (
        <h3 className='text-base font-bold text-gray-900 mb-6'>{title}</h3>
      )}
      <ResponsiveContainer width='100%' height={height}>
        {type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
            <XAxis
              dataKey='label'
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {dataKeys.length > 1 && <Legend />}
            {dataKeys.map(dk => (
              <Bar
                key={dk.key}
                dataKey={dk.key}
                name={dk.name}
                fill={dk.color}
                radius={[6, 6, 0, 0]}
              />
            ))}
          </BarChart>
        ) : (
          <AreaChart data={data}>
            <defs>
              {dataKeys.map(dk => (
                <linearGradient
                  key={dk.key}
                  id={`gradient_${dk.key}`}
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop offset='5%' stopColor={dk.color} stopOpacity={0.15} />
                  <stop offset='95%' stopColor={dk.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
            <XAxis
              dataKey='label'
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {dataKeys.length > 1 && <Legend />}
            {dataKeys.map(dk => (
              <Area
                key={dk.key}
                type='monotone'
                dataKey={dk.key}
                name={dk.name}
                stroke={dk.color}
                strokeWidth={2.5}
                fill={`url(#gradient_${dk.key})`}
                dot={{ fill: dk.color, r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            ))}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

export default AnalyticsChart
