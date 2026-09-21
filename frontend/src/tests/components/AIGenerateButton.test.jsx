import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import Button from '../../components/ui/Button'

describe('AI Generate Button behavior', () => {
  it('should render generate button', () => {
    render(<Button>🤖 Generate Questions</Button>)
    expect(screen.getByText('🤖 Generate Questions')).toBeInTheDocument()
  })

  it('should show loading state during generation', () => {
    render(<Button isLoading>🤖 Generating...</Button>)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should trigger generation on click', () => {
    const onGenerate = vi.fn()
    render(<Button onClick={onGenerate}>Generate</Button>)
    fireEvent.click(screen.getByText('Generate'))
    expect(onGenerate).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when quota is exceeded', () => {
    render(<Button disabled>🚫 Limit Reached</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
