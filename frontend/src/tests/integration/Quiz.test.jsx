import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import React from 'react'

vi.mock('../../hooks/useQuiz', () => ({
  default: () => ({
    questions: [
      {
        _id: 'q1',
        questionText: 'What is 2+2?',
        options: ['3', '4', '5', '6'],
        subject: 'math',
        difficulty: 'easy'
      }
    ],
    currentQuestion: {
      _id: 'q1',
      questionText: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      subject: 'math',
      difficulty: 'easy'
    },
    currentQuestionIndex: 0,
    selectedAnswers: {},
    currentSelectedAnswer: undefined,
    timeLeft: 600,
    isCompleted: false,
    results: null,
    progress: { answered: 0, total: 1, percentage: 0 },
    isStarting: false,
    isSubmitting: false,
    isCurrentAnswered: false,
    error: null,
    handleStartQuiz: vi.fn().mockResolvedValue({ success: true }),
    handleSelectAnswer: vi.fn(),
    handleSubmitQuiz: vi.fn(),
    handleTimeUp: vi.fn(),
    handleResetQuiz: vi.fn(),
    nextQuestion: vi.fn(),
    prevQuestion: vi.fn(),
    goToQuestion: vi.fn(),
    updateTimeLeft: vi.fn(),
    isLastQuestion: true,
    isFirstQuestion: true
  })
}))

vi.mock('../../store/useAuthStore', () => ({
  default: () => ({ user: { grade: 'Grade 12', name: 'Test Student' } })
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ subject: 'math' }),
    useNavigate: () => vi.fn()
  }
})

import StudentQuiz from '../../pages/student/Quiz'

const renderWithRouter = ui =>
  render(
    <MemoryRouter initialEntries={['/student/quiz/math']}>{ui}</MemoryRouter>
  )

describe('Student Quiz Integration', () => {
  it('should render quiz setup screen initially', () => {
    renderWithRouter(<StudentQuiz />)
    expect(screen.getByText(/Mathematics Quiz/i)).toBeInTheDocument()
  })

  it('should show number of questions selector', () => {
    renderWithRouter(<StudentQuiz />)
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('should show Start Quiz button', () => {
    renderWithRouter(<StudentQuiz />)
    expect(screen.getByText(/Start Quiz/i)).toBeInTheDocument()
  })

  it('should show difficulty selector', () => {
    renderWithRouter(<StudentQuiz />)
    expect(screen.getByText(/Mixed/i)).toBeInTheDocument()
  })
})
