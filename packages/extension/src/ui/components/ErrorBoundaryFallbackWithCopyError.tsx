import { FC, useMemo } from "react"
import styled from "styled-components"

import { coerceErrorToString } from "../../shared/utils/error"
import { useHardResetAndReload } from "../services/resetAndReload"
import { P } from "../theme/Typography"
import { CopyTooltip } from "./CopyTooltip"
import { ErrorBoundaryState } from "./ErrorBoundary"
import {
  ContentCopyIcon,
  RefreshIcon,
  ReportGmailerrorredIcon,
} from "./Icons/MuiIcons"

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

const ErrorBoundaryFallbackWithCopyError: FC<
  IErrorBoundaryFallbackWithCopyError
> = ({ error, errorInfo, message = "Sorry, an error occurred" }) => {
  const hardResetAndReload = useHardResetAndReload()
  const errorPayload = useMemo(() => {
    try {
      const displayError = coerceErrorToString(error)
      const displayStack = errorInfo?.componentStack || "No stack trace"
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
      <ActionsWrapper>
        <ActionContainer onClick={hardResetAndReload}>
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
