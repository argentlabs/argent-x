import { FC } from "react"
import styled from "styled-components"

import { ErrorBoundaryState } from "./components/ErrorBoundary"
import ErrorBoundaryFallbackWithCopyError from "./components/ErrorBoundaryFallbackWithCopyError"
import { SupportFooter } from "./features/settings/SettingsScreen"

const FullscreenFallbackContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`

const AppErrorBoundaryFallback: FC<ErrorBoundaryState> = ({
  error,
  errorInfo,
}) => {
  return (
    <FullscreenFallbackContainer>
      <ErrorBoundaryFallbackWithCopyError error={error} errorInfo={errorInfo} />
      <SupportFooter />
    </FullscreenFallbackContainer>
  )
}

export default AppErrorBoundaryFallback
