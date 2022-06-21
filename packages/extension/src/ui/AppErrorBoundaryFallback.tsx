import { FC, useCallback, useMemo } from "react"
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

const ErrorMessageContainer = styled.div`
  margin-bottom: 16px;
`

const CopyDetailsContainer = styled.div`
  text-align: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 100px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 200ms ease-in-out;
  font-size: 12px;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`

const StyledContentCopyIcon = styled(ContentCopyIcon)`
  margin-left: 0.5em;
  cursor: pointer;
  font-size: 12px;
`

const version = process.env.VERSION
const fallbackErrorPayload = JSON.stringify({
  version,
  error: "Unable to parse error",
})

const AppErrorBoundaryFallback: FC<ErrorBoundaryState> = ({
  error,
  errorInfo,
}) => {
  const onReload = useCallback(() => {
    const url = browser.runtime.getURL("index.html")
    window.location.href = url
  }, [])

  const errorPayload = useMemo(() => {
    try {
      const displayError =
        error && error.toString ? error.toString() : "Unknown error"
      const displayStack =
        errorInfo && errorInfo?.componentStack
          ? errorInfo.componentStack
          : "No stack trace"
      const payload = {
        version,
        error: displayError,
        stackTrace: displayStack,
      }
      return JSON.stringify(payload, null, 2)
    } catch (e) {
      // ignore error
    }
    return fallbackErrorPayload
  }, [error, errorInfo])

  return (
    <FullscreenFallbackContainer>
      <MessageContainer>
        <ErrorIcon />
        <ErrorMessageContainer>
          <P>Sorry, an error occurred</P>
        </ErrorMessageContainer>
        <CopyTooltip message="Copied" copyValue={errorPayload}>
          <CopyDetailsContainer>
            Copy error details
            <StyledContentCopyIcon />
          </CopyDetailsContainer>
        </CopyTooltip>
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
