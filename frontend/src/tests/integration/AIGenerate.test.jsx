import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'

vi.mock('../../store/useTeacherStore', () => ({
  default: () => ({
    questions: [],
    isGenerating: false,
    generateAIQuestion: vi.fn().mockResolvedValue({
      success: true,
      data: {
        questions: [
          {
            _id: 'ai1',
            questionText: 'AI generated math question?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 1,
            subject: 'math',
            difficulty: 'medium',
            explanation: 'AI explanation',
            isAIGenerated: true
          }
        ]
      }
    }),
    submitForApproval: vi.fn().mockResolvedValue({ success: true })
  })
}))

vi.mock('../../store/useAuthStore', () => ({
  default: () => ({
    user: { name: 'Test Teacher', subject: 'math', aiGenerationsThisMonth: 5 }
  })
}))

vi.mock('../../api/ai.api', () => ({
  default: {
    getMyHistory: vi.fn().mockResolvedValue({ data: { data: { logs: [] } } })
  }
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

import TeacherAIGenerate from '../../pages/teacher/AIGenerate'

const renderWithRouter = ui => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('Teacher AI Generate Integration', () => {
  it('should render AI generator page', () => {
    renderWithRouter(<TeacherAIGenerate />)
    expect(screen.getByText('AI Question Generator')).toBeInTheDocument()
  })

  it('should show AI prompt box', () => {
    renderWithRouter(<TeacherAIGenerate />)
    expect(screen.getByText('AI Question Generator')).toBeInTheDocument()
    expect(screen.getByText(/Monthly Usage/i)).toBeInTheDocument()
  })

  it('should show empty state when no questions generated', () => {
    renderWithRouter(<TeacherAIGenerate />)
    expect(screen.getByText('No questions generated yet')).toBeInTheDocument()
  })

  it('should display AI history panel', () => {
    renderWithRouter(<TeacherAIGenerate />)
    expect(screen.getByText('AI History')).toBeInTheDocument()
  })

  it('should show generate button', () => {
    renderWithRouter(<TeacherAIGenerate />)
    expect(screen.getByText(/Generate/i)).toBeInTheDocument()
  })
})
