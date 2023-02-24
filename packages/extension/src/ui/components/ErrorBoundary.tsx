import { Component, cloneElement } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import { routes } from "../routes"

/* https://reactrouter.com/en/main/start/faq#what-happened-to-withrouter-i-need-it */
function withRouter(Component: any) {
  function ComponentWithRouterProp(props: any) {
    const location = useLocation()
    const navigate = useNavigate()
    const params = useParams()
    return <Component {...props} router={{ location, navigate, params }} />
  }

  return ComponentWithRouterProp
}

interface ErrorBoundaryProps {
  fallback: React.ReactElement
  children: React.ReactNode
  router: any
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
      router.location.pathname === routes.settingsPrivacyStatement.path &&
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
    console.log(this.props)
    if (this.state.error) {
      const { error, errorInfo } = this.state
      return cloneElement(this.props.fallback, { error, errorInfo })
    }
    return <>{this.props.children}</>
  }
}

export const ErrorBoundary = withRouter(ErrorBoundaryComponent)
