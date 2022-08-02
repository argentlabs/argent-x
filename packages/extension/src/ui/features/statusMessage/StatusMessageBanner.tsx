import { colord } from "colord"
import { FC, useCallback, useState } from "react"
import styled from "styled-components"

import { statusMessageStore } from "../../../shared/statusMessage/storage"
import {
  IStatusMessage,
  IStatusMessageLevel,
} from "../../../shared/statusMessage/types"
import { Button } from "../../components/Button"
import { ExpandableHeightBox } from "../../components/ExpandableHeightBox"
import { CloseRoundedIcon } from "../../components/Icons/MuiIcons"
import { getColorForLevel } from "./getColorForLevel"
import { StatusMessageIcon } from "./StatusMessageIcon"
import { useShouldShowStatusMessage } from "./useShouldShowStatusMessage"
import { useStatusMessage } from "./useStatusMessage"

export interface IStatusMessageBanner {
  statusMessage: IStatusMessage | undefined
  lastDismissedMessageId?: string
  onDismiss: () => void
}

export const StatusMessageBannerContainer: FC = () => {
  const shouldShowStatusMessage = useShouldShowStatusMessage()
  const statusMessage = useStatusMessage()
  const onDismiss = useCallback(async () => {
    await statusMessageStore.setItem(
      "lastDismissedMessageId",
      statusMessage?.id,
    )
  }, [statusMessage?.id])
  if (!shouldShowStatusMessage) {
    return null
  }
  return (
    <StatusMessageBanner statusMessage={statusMessage} onDismiss={onDismiss} />
  )
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
  padding: 12px 16px;
  align-items: center;
  gap: 12px;
`

const ClickableSummary = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  gap: 6px;
  align-items: center;
  cursor: pointer;
  user-select: none;
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
  padding: 0 16px 12px 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

export const StatusMessageBanner: FC<IStatusMessageBanner> = ({
  statusMessage,
  onDismiss,
}) => {
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = useCallback(() => {
    setExpanded((expanded) => !expanded)
  }, [])
  if (!statusMessage || !statusMessage.message) {
    return null
  }
  const { summary, message, linkTitle, linkUrl, level, dismissable } =
    statusMessage
  return (
    <Container level={level} expanded={expanded}>
      <SummaryContainer>
        <ClickableSummary onClick={toggleExpanded}>
          <IconContainer level={level}>
            <StatusMessageIcon
              level={level}
              fontSize="inherit"
            ></StatusMessageIcon>
          </IconContainer>
          <SummaryText>{summary}</SummaryText>
          <ToggleButton>More</ToggleButton>
        </ClickableSummary>
        {dismissable && (
          <DismissButton onClick={onDismiss}>
            <CloseRoundedIcon fontSize="inherit" />
          </DismissButton>
        )}
      </SummaryContainer>
      <ExpandableHeightBox expanded={expanded}>
        <MessageContainer>{message}</MessageContainer>
        {linkTitle && linkUrl && (
          <MessageContainer>
            <Button
              as="a"
              size="s"
              variant={level}
              href={linkUrl}
              target="_blank"
            >
              {linkTitle}
            </Button>
          </MessageContainer>
        )}
      </ExpandableHeightBox>
    </Container>
  )
}
