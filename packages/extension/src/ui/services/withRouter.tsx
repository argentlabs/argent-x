import { useLocation, useNavigate, useParams } from "react-router-dom"

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

export { withRouter }
