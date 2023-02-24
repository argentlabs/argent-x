import { Component, cloneElement } from "react"
import { Location, RouterProps } from "react-router-dom"

import { routes } from "../routes"
import { withRouter } from "../services/withRouter"

interface ErrorBoundaryProps {
  fallback: React.ReactElement
  children: React.ReactNode
  router: RouterProps
}

export interface ErrorBoundaryState {
  error?: any
  errorInfo?: any
}

class ErrorBoundaryComponent extends Component<
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

  componentDidUpdate() {
    const { router } = this.props
    if (
      router &&
      (router.location as Location).pathname ===
        routes.settingsPrivacyStatement.path &&
      this.state.error
    ) {
      this.setState({ error: null })
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

export const ErrorBoundary = withRouter(ErrorBoundaryComponent)
