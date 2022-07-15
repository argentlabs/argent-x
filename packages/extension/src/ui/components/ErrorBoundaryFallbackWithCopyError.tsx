import * as Sentry from "@sentry/react"
import { FC, useMemo } from "react"
import styled from "styled-components"

import { ISettingsStorage } from "../../shared/settings"
import { coerceErrorToString } from "../../shared/utils/error"
import { SettingsItem, Title } from "../features/settings/SettingsScreen"
import { makeClickable } from "../services/a11y"
import { useHardResetAndReload } from "../services/resetAndReload"
import { useBackgroundSettingsValue } from "../services/useBackgroundSettingsValue"
import { P } from "../theme/Typography"
import { CopyTooltip } from "./CopyTooltip"
import { ErrorBoundaryState } from "./ErrorBoundary"
import {
  ContentCopyIcon,
  RefreshIcon,
  ReportGmailerrorredIcon,
} from "./Icons/MuiIcons"
import { WarningIcon } from "./Icons/WarningIcon"
import { LazyInitialisedIOSSwitch } from "./IOSSwitch"

const MessageContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 15px;
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
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;
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

const WarningContainer = styled.div`
  padding: 15px 0;
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

  const reportToSentry = () => {
    Sentry.withScope((scope) => {
      Object.keys(errorInfo).forEach((key) => {
        scope.setExtra(key, errorInfo[key])
      })
      Sentry.captureException(error)
    })
  }

  const {
    initialised: privacyErrorReportingInitialised,
    value: privacyErrorReportingValue,
    setValue: setPrivacyErrorReportingValue,
  } = useBackgroundSettingsValue<ISettingsStorage["privacyErrorReporting"]>(
    "privacyErrorReporting",
  )

  return (
    <MessageContainer>
      <ErrorIcon />
      <ErrorMessageContainer>
        <P>{message}</P>
      </ErrorMessageContainer>
      <ActionsWrapper>
        <CopyTooltip message="Copied" copyValue={errorPayload}>
          <ActionContainer>
            <ContentCopyIcon />
            <span>Copy error</span>
          </ActionContainer>
        </CopyTooltip>
        <ActionContainer {...makeClickable(hardResetAndReload)}>
          <RefreshIcon />
          <span>Retry</span>
        </ActionContainer>
        <ActionContainer {...makeClickable(reportToSentry)}>
          <WarningIcon />
          <span>Report error</span>
        </ActionContainer>
      </ActionsWrapper>

      <SettingsItem style={{ alignSelf: "stretch" }}>
        <Title>
          <span>Automatic Error Reporting</span>
          <LazyInitialisedIOSSwitch
            initialised={privacyErrorReportingInitialised}
            checked={privacyErrorReportingValue}
            onClick={() =>
              setPrivacyErrorReportingValue(!privacyErrorReportingValue)
            }
          />
        </Title>

        <WarningContainer>
          <P>Warning: Shared Logs might possibly contain sensitive data</P>
        </WarningContainer>
      </SettingsItem>
    </MessageContainer>
  )
}

export default ErrorBoundaryFallbackWithCopyError
