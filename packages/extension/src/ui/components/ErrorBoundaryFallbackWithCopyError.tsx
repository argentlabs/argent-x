import { FC, useCallback, useMemo } from "react"
import styled from "styled-components"
import browser from "webextension-polyfill"

import { useBackupRequired } from "../features/recovery/backupDownload.state"
import { CopyTooltip } from "./CopyTooltip"
import { ErrorBoundaryState } from "./ErrorBoundary"
import {
  ContentCopyIcon,
  RefreshIcon,
  ReportGmailerrorredIcon,
} from "./Icons/MuiIcons"
import { P } from "./Typography"

const MessageContainer = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const ErrorIcon = styled(ReportGmailerrorredIcon)`
  color: red;
  font-size: 64px;
  margin-bottom: 16px;
`

const ErrorMessageContainer = styled.div`
  margin-bottom: 16px;
`

const ActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
`

const ActionContainer = styled.div`
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 100px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 200ms ease-in-out;
  font-size: 12px;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  > svg {
    font-size: 12px;
  }
  > svg:first-child {
    margin-right: 0.5em;
  }
  > svg:last-child {
    margin-left: 0.5em;
  }
`

const version = process.env.VERSION
const fallbackErrorPayload = `v${version}

Unable to parse error
`

export interface IErrorBoundaryFallbackWithCopyError
  extends ErrorBoundaryState {
  message?: string
}

export const coerceErrorToString = (error: any): string => {
  let errorString = error?.toString?.() || "Unknown error"
  // sometimes error.toString() may return "[object Object]", attempt to stringify as a fallback
  if (errorString === "[object Object]") {
    try {
      errorString = JSON.stringify(error, null, 2)
    } catch {
      // ignore attempt to stringify the error object
    }
  }
  return errorString
}

const ErrorBoundaryFallbackWithCopyError: FC<
  IErrorBoundaryFallbackWithCopyError
> = ({ error, errorInfo, message = "Sorry, an error occurred" }) => {
  const errorPayload = useMemo(() => {
    try {
      const displayError = coerceErrorToString(error)
      const displayStack = errorInfo.componentStack || "No stack trace"
      return `v${version}

${displayError}
${displayStack}
      `
    } catch (e) {
      // ignore error
    }
    return fallbackErrorPayload
  }, [error, errorInfo])

  const onReload = useCallback(() => {
    const url = browser.runtime.getURL("index.html")

    // reset cache
    const backupState = useBackupRequired.getState()
    localStorage.clear()
    useBackupRequired.setState(backupState)

    setTimeout(() => {
      // ensure state got persisted before reloading
      window.location.href = url
    }, 100)
  }, [])

  return (
    <MessageContainer>
      <ErrorIcon />
      <ErrorMessageContainer>
        <P>{message}</P>
      </ErrorMessageContainer>
      <ActionsWrapper>
        <ActionContainer onClick={onReload}>
          <RefreshIcon />
          <span>Retry</span>
        </ActionContainer>
        <CopyTooltip message="Copied" copyValue={errorPayload}>
          <ActionContainer>
            <ContentCopyIcon />
            <span>Copy error details</span>
          </ActionContainer>
        </CopyTooltip>
      </ActionsWrapper>
    </MessageContainer>
  )
}

export default ErrorBoundaryFallbackWithCopyError
