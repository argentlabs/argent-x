import { Flex } from "@chakra-ui/react"
import { FC } from "react"

import { ErrorBoundaryState } from "./components/ErrorBoundary"
import ErrorBoundaryFallbackWithCopyError from "./components/ErrorBoundaryFallbackWithCopyError"
import { SupportFooter } from "./features/settings/SupportFooter"

const AppErrorBoundaryFallback: FC<ErrorBoundaryState> = ({
  error,
  errorInfo,
}) => {
  return (
    <Flex direction="column" w="100vw" h="100vh" px={4}>
      <ErrorBoundaryFallbackWithCopyError error={error} errorInfo={errorInfo} />
      <SupportFooter />
    </Flex>
  )
}

export default AppErrorBoundaryFallback
