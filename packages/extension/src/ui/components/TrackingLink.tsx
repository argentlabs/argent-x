import { FC, ReactNode, useCallback } from "react"

export const A: FC<{
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
  // timeout (ms) to which the tracking function is limited (default = 500)
  trackingTimeout?: number
}> = ({
  href,
  children,
  className,
  onClick,
  targetBlank = false,
  trackingTimeout = 500,
}) => {
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
    <a className={className} onClick={clickHandler}>
      {children}
    </a>
  )
}
