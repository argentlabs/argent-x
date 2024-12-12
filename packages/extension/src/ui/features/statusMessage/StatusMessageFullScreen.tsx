import { BarIconButton, H1, H5, icons } from "@argent/x-ui"
import { Button, Center, Circle, Flex } from "@chakra-ui/react"
import type { FC } from "react"

import type { IStatusMessage } from "../../../shared/statusMessage/types"
import { StatusMessageIcon } from "./StatusMessageIcon"

const { CrossSecondaryIcon } = icons

interface StatusMessageFullScreenProps {
  statusMessage: IStatusMessage | undefined
  onClose: () => void
}

export const StatusMessageFullScreen: FC<StatusMessageFullScreenProps> = ({
  statusMessage,
  onClose,
}) => {
  if (!statusMessage || !statusMessage.message) {
    return null
  }
  const { summary, message, linkTitle, linkUrl, level } = statusMessage
  const hasLink = linkTitle && linkUrl
  return (
    <Flex
      position="absolute"
      inset={0}
      direction="column"
      px={8}
      py={10}
      bgColor="surface-default"
    >
      {hasLink && (
        <BarIconButton
          onClick={onClose}
          bgColor="surface-elevated"
          position="absolute"
          right={4.5}
          top={4.5}
        >
          <CrossSecondaryIcon />
        </BarIconButton>
      )}
      <Center flex={1} flexDirection="column" textAlign="center">
        <Circle size={35} bgColor={`surface-${level}-default`}>
          <StatusMessageIcon
            color={`icon-${level}`}
            level={level}
            fontSize="6xl"
          />
        </Circle>
        <H1 mt={8}>{summary}</H1>
        <H5 mt={4}>{message}</H5>
      </Center>
      {hasLink ? (
        <Button as="a" colorScheme={level} href={linkUrl} target="_blank">
          {linkTitle}
        </Button>
      ) : (
        <Button colorScheme={level} onClick={onClose}>
          Got it
        </Button>
      )}
    </Flex>
  )
}
