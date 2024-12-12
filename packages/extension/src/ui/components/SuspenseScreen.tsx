import type { FC } from "react"
import { Suspense } from "react"
import type { ScreenSkeletonProps } from "./ScreenSkeleton"
import { ScreenSkeleton } from "./ScreenSkeleton"

export const SuspenseScreen: FC<ScreenSkeletonProps> = ({
  children,
  ...rest
}) => {
  return <Suspense fallback={<ScreenSkeleton {...rest} />}>{children}</Suspense>
}
