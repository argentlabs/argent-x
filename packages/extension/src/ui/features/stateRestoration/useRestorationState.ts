import { memoize } from "lodash-es"
import { useEffect, useRef } from "react"
import { PathPattern } from "react-router"
import { matchPath, useLocation } from "react-router-dom"

import { routes } from "../../routes"
import { useRestorationState } from "./restoration.state"

/**
 * Paths which should be captured and restored.
 */

const restorationStatePathnames: Array<string | PathPattern> = [
  /** Some users will close the extension when navigating to webmail to retreive the OTP */
  routes.shieldAccountOTP.path,
  routes.sendAmountAndAssetScreen.path,
]

const isRestorationStatePathname = memoize((pathname?: string) => {
  if (!pathname) {
    return false
  }
  return restorationStatePathnames.some((pattern) =>
    matchPath(pattern, pathname),
  )
})

/**
 * Capture entryRoute for paths in {@link restorationStatePathnames}.
 * NOTE at present ONLY the route itself will be restored, no other state is captured
 */
export const useCaptureEntryRouteRestorationState = () => {
  const currentLocation = useLocation()
  const lastKnownLocationRef = useRef(currentLocation)
  useEffect(() => {
    const { pathname, search } = currentLocation
    if (isRestorationStatePathname(pathname)) {
      useRestorationState.setState({ entryRoute: { pathname, search } })
    } else {
      if (isRestorationStatePathname(lastKnownLocationRef.current?.pathname)) {
        /** user navigated away from a restoration route, so unset it */
        useRestorationState.setState({ entryRoute: undefined })
      }
    }
    lastKnownLocationRef.current = currentLocation
  }, [currentLocation])
}
