import { chakra, forwardRef } from "@chakra-ui/react"
import { useCallback } from "react"

export interface TrackingLinkProps {
  // href - url where navigate when tracking function is resolved
  href: string
  // tracking function must be a Promise instance
  onClick?: () => Promise<unknown>
  // opens link in a new tab/window (default = false)
  targetBlank?: boolean
  // timeout (ms) to which the tracking function is limited (default = 500)
  trackingTimeout?: number
}

export const TrackingLink = forwardRef<TrackingLinkProps, "a">(
  (
    { href, onClick, targetBlank = false, trackingTimeout = 500, ...rest },
    ref,
  ) => {
    const clickHandler = useCallback(
      async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        if (onClick) {
          await Promise.race([
            onClick?.(),
            new Promise((resolve) => setTimeout(resolve, trackingTimeout)),
          ])
        }
        window.open(
          href,
          targetBlank ? "_blank" : "_self",
          targetBlank ? "noopener noreferrer" : undefined,
        )
      },
      [href, onClick, targetBlank, trackingTimeout],
    )

    return (
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      <chakra.a ref={ref} onClick={clickHandler} {...rest} />
    )
  },
)
