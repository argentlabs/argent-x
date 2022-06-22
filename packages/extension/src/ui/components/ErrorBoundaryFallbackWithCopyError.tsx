import { FC, useMemo } from "react"
import styled from "styled-components"

import { CopyTooltip } from "./CopyTooltip"
import { ErrorBoundaryState } from "./ErrorBoundary"
import { ContentCopyIcon, ReportGmailerrorredIcon } from "./Icons/MuiIcons"
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

  return (
    <MessageContainer>
      <ErrorIcon />
      <ErrorMessageContainer>
        <P>{message}</P>
      </ErrorMessageContainer>
      <CopyTooltip message="Copied" copyValue={errorPayload}>
        <CopyDetailsContainer>
          Copy error details
          <StyledContentCopyIcon />
        </CopyDetailsContainer>
      </CopyTooltip>
    </MessageContainer>
  )
}

export default ErrorBoundaryFallbackWithCopyError
