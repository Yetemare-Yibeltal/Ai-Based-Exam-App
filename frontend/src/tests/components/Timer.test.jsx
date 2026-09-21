import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import React from 'react'
import Timer from '../../components/quiz/Timer'

describe('Timer component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render initial time', () => {
    render(<Timer totalSeconds={60} onTimeUp={vi.fn()} />)
    expect(screen.getByText('1:00')).toBeInTheDocument()
  })

  it('should show time remaining label', () => {
    render(<Timer totalSeconds={120} onTimeUp={vi.fn()} />)
    expect(screen.getByText('Time Remaining')).toBeInTheDocument()
  })

  it('should count down', async () => {
    render(<Timer totalSeconds={60} onTimeUp={vi.fn()} autoStart />)
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.getByText('0:55')).toBeInTheDocument()
  })

  it('should call onTimeUp when timer reaches zero', async () => {
    const onTimeUp = vi.fn()
    render(<Timer totalSeconds={3} onTimeUp={onTimeUp} autoStart />)
    act(() => {
      vi.advanceTimersByTime(4000)
    })
    expect(onTimeUp).toHaveBeenCalledTimes(1)
  })

  it('should render timer icon', () => {
    render(<Timer totalSeconds={60} onTimeUp={vi.fn()} />)
    expect(screen.getByText('⏱️')).toBeInTheDocument()
  })
})
