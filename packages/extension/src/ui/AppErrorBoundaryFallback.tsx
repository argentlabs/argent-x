import { FC, useCallback } from "react"
import styled from "styled-components"
import browser from "webextension-polyfill"

import { Button } from "./components/Button"
import { CopyTooltip } from "./components/CopyTooltip"
import { ErrorBoundaryState } from "./components/ErrorBoundary"
import {
  ContentCopyIcon,
  ReportGmailerrorredIcon,
} from "./components/Icons/MuiIcons"
import { P } from "./components/Typography"
import { SupportFooter } from "./features/settings/SettingsScreen"

const FullscreenFallbackContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`
const MessageContainer = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`
const ButtonContainer = styled.div`
  display: flex;
  padding: 24px 32px;
`
const ErrorIcon = styled(ReportGmailerrorredIcon)`
  color: red;
  font-size: 64px;
  margin-bottom: 16px;
`

const StyledContentCopyIcon = styled(ContentCopyIcon)`
  margin-left: 0.5em;
  cursor: pointer;
  font-size: 12px;
`

const AppErrorBoundaryFallback: FC<ErrorBoundaryState> = ({
  error,
  errorInfo,
}) => {
  const onReload = useCallback(() => {
    const url = browser.runtime.getURL("index.html")
    window.location.href = url
  }, [])

  const displayError =
    error && error.toString ? error.toString() : "Unknown error"
  const displayStack = errorInfo ? errorInfo.componentStack : "No stack trace"

  return (
    <FullscreenFallbackContainer>
      <MessageContainer>
        <ErrorIcon />
        <P>Sorry, an error ocurred</P>
        <CopyTooltip message="Copied" copyValue={"Hello!"}>
          <StyledContentCopyIcon />
        </CopyTooltip>
        <pre>{JSON.stringify({ displayError, displayStack }, null, 2)}</pre>
      </MessageContainer>
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
