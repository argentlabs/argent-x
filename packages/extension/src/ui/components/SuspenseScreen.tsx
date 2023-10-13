import { FC, Suspense } from "react"
import { ScreenSkeleton, ScreenSkeletonProps } from "./ScreenSkeleton"

export const SuspenseScreen: FC<ScreenSkeletonProps> = ({
  children,
  ...rest
}) => {
  return <Suspense fallback={<ScreenSkeleton {...rest} />}>{children}</Suspense>
}
