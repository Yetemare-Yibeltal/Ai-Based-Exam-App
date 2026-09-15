import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import useTimer from '../../hooks/useTimer'

const Timer = ({
  totalSeconds,
  onTimeUp,
  autoStart = true,
  onTick = null,
  className = ''
}) => {
  const { timeLeft, formattedTime, percentage, isLow, isCritical, start } =
    useTimer(totalSeconds, onTimeUp, autoStart)

  useEffect(() => {
    if (!autoStart) start()
  }, [])

  useEffect(() => {
    if (onTick) onTick(timeLeft)
  }, [timeLeft])

  const getColor = () => {
    if (isCritical) return 'text-red-600'
    if (isLow) return 'text-orange-500'
    return 'text-primary-900'
  }

  const getBarColor = () => {
    if (isCritical) return 'bg-red-500'
    if (isLow) return 'bg-orange-400'
    return 'bg-primary-900'
  }

  const getBgColor = () => {
    if (isCritical) return 'bg-red-50 border-red-200'
    if (isLow) return 'bg-orange-50 border-orange-200'
    return 'bg-blue-50 border-blue-200'
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${getBgColor()}`}
      >
        <motion.span
          animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: isCritical ? Infinity : 0 }}
          className='text-xl'
        >
          ⏱️
        </motion.span>
        <div className='flex-1'>
          <div className='progress-bar h-2 mb-1'>
            <motion.div
              className={`progress-fill ${getBarColor()}`}
              initial={{ width: '100%' }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-xs text-gray-500'>Time Remaining</span>
            <motion.span
              key={formattedTime}
              initial={isCritical ? { scale: 1.2 } : {}}
              animate={{ scale: 1 }}
              className={`text-lg font-bold font-mono ${getColor()}`}
            >
              {formattedTime}
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Timer
