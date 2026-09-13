import React from 'react'
import Button from './Button'

class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError (error) {
    return { hasError: true, error }
  }

  componentDidCatch (error, errorInfo) {
    this.setState({ errorInfo })
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render () {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
          <div className='max-w-md w-full bg-white rounded-2xl shadow-card border border-gray-100 p-8 text-center'>
            <div className='text-6xl mb-4'>💥</div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Something went wrong
            </h2>
            <p className='text-gray-500 mb-6'>
              {import.meta.env.DEV
                ? this.state.error?.message
                : 'An unexpected error occurred. Please refresh the page and try again.'}
            </p>
            {import.meta.env.DEV && this.state.errorInfo && (
              <details className='text-left bg-gray-50 rounded-xl p-4 mb-6 text-xs text-gray-600 overflow-auto max-h-32'>
                {this.state.errorInfo.componentStack}
              </details>
            )}
            <div className='flex flex-col gap-3'>
              <Button onClick={this.handleReset} variant='primary' fullWidth>
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant='outline'
                fullWidth
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
