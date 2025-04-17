import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '../login-form'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

// Mock the next-auth/react module
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}))

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock the useToast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}))

describe('LoginForm', () => {
  const mockRouter = {
    push: jest.fn(),
  }

  const mockToast = {
    toast: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useToast as jest.Mock).mockReturnValue(mockToast)
  })

  it('renders login form', () => {
    render(<LoginForm />)
    
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('shows validation errors for invalid input', async () => {
    render(<LoginForm />)
    
    // Submit form without filling in fields
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })
  })

  it('handles successful login', async () => {
    ;(signIn as jest.Mock).mockResolvedValueOnce({ error: null })
    
    render(<LoginForm />)
    
    // Fill in form fields
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      })
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('handles login error', async () => {
    ;(signIn as jest.Mock).mockResolvedValueOnce({ error: 'Invalid credentials' })
    
    render(<LoginForm />)
    
    // Fill in form fields
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' },
    })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Invalid email or password',
        variant: 'destructive',
      })
    })
  })
}) 