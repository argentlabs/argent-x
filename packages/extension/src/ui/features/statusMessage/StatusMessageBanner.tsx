import { Collapse } from "@mui/material"
import { colord } from "colord"
import { FC, useCallback, useState } from "react"
import styled, {
  DefaultTheme,
  StyledComponentProps,
  css,
} from "styled-components"

import {
  IStatusMessage,
  IStatusMessageLevel,
} from "../../../shared/statusMessage/types"
import { Button } from "../../components/Button"
import { CloseRoundedIcon } from "../../components/Icons/MuiIcons"
import { getColorForLevel } from "./getColorForLevel"
import { StatusMessageIcon } from "./StatusMessageIcon"

export interface IStatusMessageBanner
  // eslint-disable-next-line @typescript-eslint/ban-types
  extends StyledComponentProps<"div", DefaultTheme, {}, never> {
  statusMessage:
    | Pick<
        IStatusMessage,
        | "summary"
        | "message"
        | "linkTitle"
        | "linkUrl"
        | "level"
        | "dismissable"
      >
    | undefined
  onDismiss: () => void
  extendable?: boolean
}

const ToggleButton = styled.div`
  opacity: 0;
  border-radius: 500px;
  padding: 4px 10px;
  transition: opacity 0.2s;
  background-color: rgba(0, 0, 0, 0.2);
`

const Container = styled.div<{
  level: IStatusMessageLevel
  expanded: boolean
}>`
  overflow: hidden;
  background-color: ${({ theme, level }) =>
    colord(getColorForLevel({ theme, level })).alpha(0.3).toRgbString()};
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.2;
  color: ${({ theme }) => theme.text1};
  font-weight: 600;
  padding: 12px 16px;
  &:hover {
    ${ToggleButton} {
      opacity: ${({ expanded }) => (expanded ? 0 : 1)};
    }
  }
`

const IconContainer = styled.div<{ level: IStatusMessageLevel }>`
  font-size: 16px;
  color: ${getColorForLevel};
  display: flex;
  flex-direction: row;
  align-items: center;
`

const SummaryContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`

const ClickableSummary = styled.div<{ extendable?: boolean }>`
  display: flex;
  flex: 1;
  flex-direction: row;
  gap: 6px;
  align-items: center;
  ${({ extendable }) =>
    extendable &&
    css`
      user-select: none;
      cursor: pointer;
    `}
`

const SummaryText = styled.div`
  display: flex;
  margin-right: auto;
`

const DismissButton = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const MessageContainer = styled.div`
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

export const StatusMessageBanner: FC<IStatusMessageBanner> = ({
  statusMessage,
  onDismiss,
  extendable = true,
  ...rest
}) => {
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = useCallback(() => {
    if (extendable) {
      setExpanded((expanded) => !expanded)
    }
  }, [extendable])
  if (!statusMessage || !statusMessage.message) {
    return null
  }
  const { summary, message, linkTitle, linkUrl, level, dismissable } =
    statusMessage
  return (
    <Container level={level} expanded={expanded} {...rest}>
      <SummaryContainer>
        <ClickableSummary extendable={extendable} onClick={toggleExpanded}>
          <IconContainer level={level}>
            <StatusMessageIcon
              level={level}
              fontSize="inherit"
            ></StatusMessageIcon>
          </IconContainer>
          <SummaryText>{summary}</SummaryText>
          {extendable && <ToggleButton>More</ToggleButton>}
        </ClickableSummary>
        {dismissable && (
          <DismissButton onClick={onDismiss}>
            <CloseRoundedIcon fontSize="inherit" />
          </DismissButton>
        )}
      </SummaryContainer>
      <Collapse in={expanded} timeout="auto">
        <MessageContainer>
          {message}
          {linkTitle && linkUrl && (
            <Button
              as="a"
              size="s"
              variant={level}
              href={linkUrl}
              target="_blank"
              style={{ marginTop: 16 }}
            >
              {linkTitle}
            </Button>
          )}
        </MessageContainer>
      </Collapse>
    </Container>
  )
}
