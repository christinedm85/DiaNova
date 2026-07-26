import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="glass p-8 max-w-md text-center">
            <p className="text-4xl mb-4">😕</p>
            <h3 className="font-display text-xl font-semibold text-surface-100 mb-2">
              Something went wrong in this section
            </h3>
            <p className="text-surface-400 text-sm mb-6">
              An unexpected error occurred. This is usually temporary — try again.
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-500 text-white text-sm font-medium hover:bg-accent-400 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
