import { Component, cloneElement } from "react"

interface ErrorBoundaryProps {
  fallback: React.ReactElement
  children: React.ReactNode
}

export interface ErrorBoundaryState {
  error?: any
  errorInfo?: any
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state = { error: null, errorInfo: null }

  /** server-side error */
  static getDerivedStateFromError(error: unknown) {
    return {
      error,
    }
  }

  /** client-side error with info */
  componentDidCatch(error: any, errorInfo: any) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
  }

  render() {
    if (this.state.error) {
      const { error, errorInfo } = this.state
      return cloneElement(this.props.fallback, { error, errorInfo })
    }
    return <>{this.props.children}</>
  }
}
