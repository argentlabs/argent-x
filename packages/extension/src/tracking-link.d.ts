declare module "tracking-link" {
  import { ReactNode, FC } from "react"

  interface TrackingLinkProps {
    // href - url where navigate when tracking function is resolved
    href: string
    // a React node you want to wrap into <a> link
    children?: ReactNode
    // className is applied to the <a> tag
    className?: string
    // tracking function must be a Promise instance
    onClick?: () => Promise<unknown>
    // opens link in a new tab/window (default = false)
    targetBlank?: boolean
    // don't navigate to the url (default = false)
    preventDefault?: boolean
    // timeout (ms) to which the tracking function is limited (default = 500)
    trackingTimeout?: number
  }

  const Component: FC<TrackingLinkProps>

  export default Component
}
