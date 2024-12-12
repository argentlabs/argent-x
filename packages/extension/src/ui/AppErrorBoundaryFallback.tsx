import type { FC } from "react"

import type { ErrorBoundaryState } from "./components/ErrorBoundary"
import { ErrorBoundaryFallbackWithCopyError } from "./components/ErrorBoundaryFallbackWithCopyError"
import { SupportFooter } from "./features/settings/ui/SupportFooter"
import { ScrollContainer } from "@argent/x-ui"

const AppErrorBoundaryFallback: FC<ErrorBoundaryState> = ({
  error,
  errorInfo,
}) => {
  return (
    <ScrollContainer w="100vw" h="100vh" py={4}>
      <ErrorBoundaryFallbackWithCopyError
        error={error}
        errorInfo={errorInfo}
        px={4}
        pb={4}
      />
      <SupportFooter />
    </ScrollContainer>
  )
}

export default AppErrorBoundaryFallback
