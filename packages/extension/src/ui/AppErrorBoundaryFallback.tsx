import { FC, useCallback } from "react"
import styled from "styled-components"
import browser from "webextension-polyfill"

import { Button } from "./components/Button"
import { ErrorBoundaryState } from "./components/ErrorBoundary"
import ErrorBoundaryFallbackWithCopyError from "./components/ErrorBoundaryFallbackWithCopyError"
import { SupportFooter } from "./features/settings/SettingsScreen"

const FullscreenFallbackContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`

const ButtonContainer = styled.div`
  display: flex;
  padding: 24px 32px;
`

const AppErrorBoundaryFallback: FC<ErrorBoundaryState> = ({
  error,
  errorInfo,
}) => {
  const onReload = useCallback(() => {
    const url = browser.runtime.getURL("index.html")
    window.location.href = url
  }, [])

  return (
    <FullscreenFallbackContainer>
      <ErrorBoundaryFallbackWithCopyError error={error} errorInfo={errorInfo} />
      <SupportFooter />
      <ButtonContainer>
        <Button type="submit" onClick={onReload}>
          Reload
        </Button>
      </ButtonContainer>
    </FullscreenFallbackContainer>
  )
}

export default AppErrorBoundaryFallback
