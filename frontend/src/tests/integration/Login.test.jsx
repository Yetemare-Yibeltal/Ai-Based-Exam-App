import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'

vi.mock('../../hooks/useAuth', () => ({
  default: () => ({
    handleLogin: vi.fn().mockResolvedValue({ success: true }),
    isLoading: false,
    error: null
  })
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

import StudentLogin from '../../pages/student/Login'

const renderWithRouter = ui => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('Student Login Integration', () => {
  it('should render login form', () => {
    renderWithRouter(<StudentLogin />)
    expect(screen.getByText('Welcome Back! 👋')).toBeInTheDocument()
  })

  it('should show email and password inputs', () => {
    renderWithRouter(<StudentLogin />)
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Enter your password')
    ).toBeInTheDocument()
  })

  it('should show Sign In button', () => {
    renderWithRouter(<StudentLogin />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should show validation error for empty email', async () => {
    renderWithRouter(<StudentLogin />)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
  })

  it('should show validation error for invalid email', async () => {
    renderWithRouter(<StudentLogin />)
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'notanemail' }
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    })
  })

  it('should show link to teacher login', () => {
    renderWithRouter(<StudentLogin />)
    expect(screen.getByText(/teacher/i)).toBeInTheDocument()
  })

  it('should show forgot password link', () => {
    renderWithRouter(<StudentLogin />)
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument()
  })
})
