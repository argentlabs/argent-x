import { Collapse } from "@mui/material"
import * as Sentry from "@sentry/react"
import { FC, useCallback, useMemo, useState } from "react"
import styled from "styled-components"

import {
  ISettingsStorage,
  setSetting,
  settingsStorage,
} from "../../shared/settings"
import { useObjectStorage } from "../../shared/storage/hooks"
import { coerceErrorToString } from "../../shared/utils/error"
import { ResponsiveBehaviour, ScrollBehaviour } from "../AppRoutes"
import { SettingsItem, Title } from "../features/settings/SettingsScreen"
import { makeClickable } from "../services/a11y"
import { useHardResetAndReload } from "../services/resetAndReload"
import { P } from "../theme/Typography"
import { ColumnCenter } from "./Column"
import { CopyTooltip } from "./CopyTooltip"
import { ErrorBoundaryState } from "./ErrorBoundary"
import { AlertIcon } from "./Icons/AlertIcon"
import {
  ContentCopyIcon,
  KeyboardArrowDownRounded,
  RefreshIcon,
} from "./Icons/MuiIcons"
import { WarningIcon } from "./Icons/WarningIcon"
import IOSSwitch from "./IOSSwitch"

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;

  padding: 62px 16px 21px;
`

const ErrorMessageContainer = styled.div`
  margin-bottom: 16px;
`

export const ActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;
`

export const ActionContainer = styled.div`
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

const ErrorLogsContainer = styled(ColumnCenter)`
  margin-top: 4px;
`
const ShowLogsToggle = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  gap: 4px;
  align-items: flex-end;
  font-size: 11px;
  line-height: 14px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
`
const Logs = styled.div`
  margin-top: 12px;
  background-color: ${({ theme }) => theme.black};
  color: ${({ theme }) => theme.text1};
  padding: 16px;
  overflow: hidden;
`

const StyledSettingsItem = styled(SettingsItem)`
  align-self: stretch;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.bg2};
  border-radius: 8px;
  margin-top: 9px;
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
  const [viewLogs, setViewLogs] = useState(false)

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

  const reportToSentry = useCallback(() => {
    Sentry.withScope((scope) => {
      Object.keys(errorInfo).forEach((key) => {
        scope.setExtra(key, errorInfo[key])
      })
      Sentry.captureException(error)
    })
  }, [error, errorInfo])

  const { privacyErrorReporting } =
    useObjectStorage<ISettingsStorage>(settingsStorage)

  return (
    <ScrollBehaviour>
      <ResponsiveBehaviour>
        <MessageContainer>
          <AlertIcon style={{ marginBottom: "15px" }} />
          <ErrorMessageContainer>
            <P style={{ textAlign: "center" }}>{message}</P>

            <ErrorLogsContainer>
              <ShowLogsToggle
                {...makeClickable(() => setViewLogs(!viewLogs), {
                  label: "Show error logs",
                })}
              >
                View Logs
                <KeyboardArrowDownRounded
                  style={{
                    transition: "transform 0.2s ease-in-out",
                    transform: viewLogs ? "rotate(-180deg)" : "rotate(0deg)",
                    height: 13,
                    width: 13,
                  }}
                />
              </ShowLogsToggle>
            </ErrorLogsContainer>
            <Collapse
              in={viewLogs}
              timeout="auto"
              style={{ borderRadius: "8px" }}
            >
              <Logs>
                <pre style={{ whiteSpace: "pre-wrap", lineBreak: "anywhere" }}>
                  {errorPayload}
                </pre>
              </Logs>
            </Collapse>
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

          {!privacyErrorReporting && (
            <StyledSettingsItem>
              <Title>
                <span
                  style={{
                    fontSize: "12px",
                    lineHeight: "16px",
                    fontWeight: 600,
                  }}
                >
                  Automatic Error Reporting.{" "}
                  <span style={{ fontWeight: 400 }}>
                    Be aware that shared logs might contain sensitive data
                  </span>
                </span>
                <IOSSwitch
                  checked={privacyErrorReporting}
                  onClick={async () =>
                    await setSetting(
                      "privacyErrorReporting",
                      !privacyErrorReporting,
                    )
                  }
                />
              </Title>
            </StyledSettingsItem>
          )}
        </MessageContainer>
      </ResponsiveBehaviour>
    </ScrollBehaviour>
  )
}

export default ErrorBoundaryFallbackWithCopyError
