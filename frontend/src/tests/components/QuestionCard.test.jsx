import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import QuestionCard from '../../components/quiz/QuestionCard'

const mockQuestion = {
  _id: 'q1',
  questionText: 'What is 2 + 2?',
  options: ['3', '4', '5', '6'],
  subject: 'math',
  difficulty: 'easy',
  topic: 'Arithmetic'
}

describe('QuestionCard component', () => {
  it('should render question text', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        onSelectAnswer={vi.fn()}
      />
    )
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
  })

  it('should render all 4 options', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        onSelectAnswer={vi.fn()}
      />
    )
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('should call onSelectAnswer when option is clicked', () => {
    const onSelect = vi.fn()
    render(
      <QuestionCard
        question={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        onSelectAnswer={onSelect}
      />
    )
    fireEvent.click(screen.getByText('4'))
    expect(onSelect).toHaveBeenCalledWith(1)
  })

  it('should show question number', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        questionNumber={3}
        totalQuestions={10}
        onSelectAnswer={vi.fn()}
      />
    )
    expect(screen.getByText('Q3/10')).toBeInTheDocument()
  })

  it('should not call onSelectAnswer when disabled', () => {
    const onSelect = vi.fn()
    render(
      <QuestionCard
        question={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        onSelectAnswer={onSelect}
        disabled
      />
    )
    fireEvent.click(screen.getByText('4'))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('should show topic when available', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        onSelectAnswer={vi.fn()}
      />
    )
    expect(screen.getByText(/Arithmetic/)).toBeInTheDocument()
  })

  it('should return null when no question provided', () => {
    const { container } = render(
      <QuestionCard
        question={null}
        questionNumber={1}
        totalQuestions={5}
        onSelectAnswer={vi.fn()}
      />
    )
    expect(container.firstChild).toBeNull()
  })
})
