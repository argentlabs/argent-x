import { colord } from "colord"
import { FC, useCallback } from "react"
import styled from "styled-components"

import { statusMessageStore } from "../../../shared/statusMessage/storage"
import {
  IStatusMessage,
  IStatusMessageLevel,
} from "../../../shared/statusMessage/types"
import { CloseIcon } from "../../components/Icons/CloseIcon"
import { Paragraph, Title } from "../../components/Page"
import { getColorForLevel } from "./getColorForLevel"
import { StatusMessageIcon } from "./StatusMessageIcon"
import { useStatusMessage } from "./useStatusMessage"
import { Button } from "@chakra-ui/react"

export interface IStatusMessageFullScreen {
  statusMessage: IStatusMessage | undefined
  onClose: () => void
}

export const StatusMessageFullScreenContainer: FC = () => {
  const statusMessage = useStatusMessage()
  const onClose = useCallback(async () => {
    await statusMessageStore.set(
      "lastFullScreenMessageClosedId",
      statusMessage?.id,
    )
  }, [statusMessage?.id])
  return (
    <StatusMessageFullScreen statusMessage={statusMessage} onClose={onClose} />
  )
}

const Container = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.bg1};
  padding: 32px 40px;
`

const CloseIconContainer = styled.div`
  position: absolute;
  right: 18px;
  top: 18px;
`

const IconContainer = styled.div<{ level: IStatusMessageLevel }>`
  width: 140px;
  height: 140px;
  border-radius: 500px;
  background-color: ${({ theme, level }) =>
    colord(getColorForLevel({ theme, level })).alpha(0.2).toRgbString()};
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${getColorForLevel};
  font-size: 58px;
`

const SummaryContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const SummaryText = styled(Title)`
  text-align: center;
  margin-bottom: 16px;
`

const MessageText = styled(Paragraph)`
  text-align: center;
`

export const StatusMessageFullScreen: FC<IStatusMessageFullScreen> = ({
  statusMessage,
  onClose,
}) => {
  if (!statusMessage || !statusMessage.message) {
    return null
  }
  const { summary, message, linkTitle, linkUrl, level } = statusMessage
  const hasLink = linkTitle && linkUrl
  return (
    <Container>
      {hasLink && (
        <CloseIconContainer>
          <div onClick={onClose}>
            <CloseIcon />
          </div>
        </CloseIconContainer>
      )}
      <SummaryContainer>
        <IconContainer level={level}>
          <StatusMessageIcon
            level={level}
            fontSize="inherit"
          ></StatusMessageIcon>
        </IconContainer>
        <SummaryText>{summary}</SummaryText>
        <MessageText>{message}</MessageText>
      </SummaryContainer>
      {hasLink ? (
        <Button as="a" colorScheme={level} href={linkUrl} target="_blank">
          {linkTitle}
        </Button>
      ) : (
        <Button colorScheme={level} onClick={onClose}>
          Got it
        </Button>
      )}
    </Container>
  )
}
