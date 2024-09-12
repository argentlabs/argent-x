import { FC, PropsWithChildren } from "react"

import { useCaptureEntryRouteRestorationState } from "./useRestorationState"

export const CaptureEntryRouteRestorationState: FC<PropsWithChildren> = ({
  children,
}) => {
  useCaptureEntryRouteRestorationState()
  return <>{children}</>
}
