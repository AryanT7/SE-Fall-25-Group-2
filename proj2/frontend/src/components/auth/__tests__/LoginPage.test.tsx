import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
// import { vi } from 'vitest'
import { toast } from 'sonner'
import LoginPage from '../LoginPage'
import { render, createMockOnLogin, mockUsers } from '../../../test/utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
// Mock the toast function
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('LoginPage Component', () => {
  const mockOnLogin = createMockOnLogin()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders login form with correct title and description', () => {
      render(<LoginPage onLogin={mockOnLogin} />)
      
      expect(screen.getByText('Welcome to FoodApp')).toBeInTheDocument()
      expect(screen.getByText('Sign in to your account to continue')).toBeInTheDocument()
    })

    it('renders both customer and restaurant tabs', () => {
      render(<LoginPage onLogin={mockOnLogin} />)
      
      expect(screen.getByText('Customer')).toBeInTheDocument()
      expect(screen.getByText('Restaurant')).toBeInTheDocument()
    })

it('renders demo credentials section', () => {
    render(<LoginPage onLogin={mockOnLogin} />)
    
    expect(screen.getByText('Demo Credentials:')).toBeInTheDocument()
    expect(screen.getByText(/customer@demo\.com/)).toBeInTheDocument()
    expect(screen.getByText(/restaurant@demo\.com/)).toBeInTheDocument()
    expect(screen.getByText(/staff@demo\.com/)).toBeInTheDocument()
  })

    it('renders sign up link', () => {
      render(<LoginPage onLogin={mockOnLogin} />)
      
      const signUpLink = screen.getByText('Sign up')
      expect(signUpLink).toBeInTheDocument()
      expect(signUpLink.closest('a')).toHaveAttribute('href', '/register')
    })
  })

  describe('Customer Tab Functionality', () => {
    it('renders customer form fields', () => {
      render(<LoginPage onLogin={mockOnLogin} />)
      
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    })

    it('allows user to input email and password', async () => {
      const user = userEvent.setup()
      render(<LoginPage onLogin={mockOnLogin} />)
      
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('password123')
    })

    it('shows loading state during login', async () => {
      const user = userEvent.setup()
      render(<LoginPage onLogin={mockOnLogin} />)
      
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })
      
      await user.type(emailInput, 'customer@demo.com')
      await user.type(passwordInput, 'password')
      await user.click(submitButton)
      
      expect(screen.getByText('Signing in...')).toBeInTheDocument()
    })

    it('calls onLogin with correct user data for valid customer credentials', async () => {
      const user = userEvent.setup()
      render(<LoginPage onLogin={mockOnLogin} />)
      
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })
      
      await user.type(emailInput, 'customer@demo.com')
      await user.type(passwordInput, 'password')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledWith(mockUsers[0])
        expect(toast.success).toHaveBeenCalledWith('Login successful!')
      })
    })
    /**
    it('shows error for invalid customer credentials', async () => {
        const user = userEvent.setup()
        render(<LoginPage onLogin={mockOnLogin} />)
        
        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const submitButton = screen.getByRole('button', { name: 'Sign In' })
        
        // Use an email that definitely won't match any mock users
        await user.type(emailInput, 'completelynonexistent@example.com')
        await user.type(passwordInput, 'wrongpassword')
        await user.click(submitButton)
        
        await waitFor(() => {
          expect(mockOnLogin).not.toHaveBeenCalled()
          expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
        })
      })
    */
    it('handles customer demo login', async () => {
      const user = userEvent.setup()
      render(<LoginPage onLogin={mockOnLogin} />)
      
      const demoButton = screen.getByText('Try Customer Demo')
      await user.click(demoButton)
      
      expect(mockOnLogin).toHaveBeenCalledWith(mockUsers[0])
      expect(toast.success).toHaveBeenCalledWith('Logged in as customer!')
    })
  })

  describe('Restaurant Tab Functionality', () => {
    beforeEach(() => {
      render(<LoginPage onLogin={mockOnLogin} />)
      const restaurantTab = screen.getByText('Restaurant')
      fireEvent.click(restaurantTab)
    })

    it('renders restaurant form fields', () => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    })

    it('calls onLogin with correct user data for valid restaurant credentials', async () => {
      const user = userEvent.setup()
      
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })
      
      await user.type(emailInput, 'restaurant@demo.com')
      await user.type(passwordInput, 'password')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledWith(mockUsers[1])
        expect(toast.success).toHaveBeenCalledWith('Login successful!')
      })
    })

    it('handles restaurant demo login', async () => {
      const user = userEvent.setup()
      
      const demoButton = screen.getByText('Try Restaurant Demo')
      await user.click(demoButton)
      
      expect(mockOnLogin).toHaveBeenCalledWith(mockUsers[1])
      expect(toast.success).toHaveBeenCalledWith('Logged in as restaurant!')
    })

    it('handles staff demo login', async () => {
      const user = userEvent.setup()
      
      const demoButton = screen.getByText('Try Staff Demo')
      await user.click(demoButton)
      
      expect(mockOnLogin).toHaveBeenCalledWith(mockUsers[2])
      expect(toast.success).toHaveBeenCalledWith('Logged in as staff!')
    })
  })

  describe('Form Validation', () => {
    it('requires email and password fields', () => {
      render(<LoginPage onLogin={mockOnLogin} />)
      
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      
      expect(emailInput).toBeRequired()
      expect(passwordInput).toBeRequired()
    })

    it('validates email format', async () => {
      const user = userEvent.setup()
      render(<LoginPage onLogin={mockOnLogin} />)
      
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })
      
      await user.type(emailInput, 'invalid-email')
      await user.type(passwordInput, 'password')
      await user.click(submitButton)
      
      // HTML5 validation should prevent form submission
      expect(mockOnLogin).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(<LoginPage onLogin={mockOnLogin} />)
      
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('has proper button roles', () => {
      render(<LoginPage onLogin={mockOnLogin} />)
      
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Try Customer Demo' })).toBeInTheDocument()
    })

    it('has proper tab navigation', () => {
      render(<LoginPage onLogin={mockOnLogin} />)
      
      const customerTab = screen.getByText('Customer')
      const restaurantTab = screen.getByText('Restaurant')
      
      expect(customerTab).toBeInTheDocument()
      expect(restaurantTab).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      const user = userEvent.setup()
      render(<LoginPage onLogin={mockOnLogin} />)
      
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })
      
      await user.type(emailInput, 'nonexistent@example.com')
      await user.type(passwordInput, 'password')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnLogin).not.toHaveBeenCalled()
        expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
      })
    })
  })
})
