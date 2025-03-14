import { HeartPrimaryIcon, CrossSecondaryIcon } from "@argent/x-ui/icons"
import { BarIconButton, H1, H5 } from "@argent/x-ui"
import { Button, Center, Circle, Flex } from "@chakra-ui/react"
import type { FC } from "react"

interface ReviewFeedbackScreenProps {
  onSubmit: () => void
  onClose: () => void
  rating?: number
  browserName?: string
}

export const ReviewFeedbackScreen: FC<ReviewFeedbackScreenProps> = ({
  onSubmit,
  onClose,
  rating,
  browserName,
}) => {
  const message =
    rating === 5 ? (
      <>
        We’re thrilled to hear you’re enjoying Argent&nbsp;X. We would really
        appreciate if you could help spread the word by also rating us on the{" "}
        {browserName} store
      </>
    ) : (
      <>
        We’re thrilled to hear you’re enjoying Argent&nbsp;X, but it sounds like
        we could still be doing better
      </>
    )
  return (
    <Flex flex={1} direction="column" px={8} py={10} bgColor="surface-default">
      <BarIconButton
        onClick={onClose}
        bgColor="surface-elevated"
        position="absolute"
        right={4.5}
        top={4.5}
      >
        <CrossSecondaryIcon />
      </BarIconButton>
      <Center flex={1} flexDirection="column" textAlign="center">
        <Circle size={35} bgColor={`surface-danger-default`}>
          <HeartPrimaryIcon color={`icon-danger`} fontSize="6xl" />
        </Circle>
        <H1 mt={8}>Thank You!</H1>
        <H5 mt={4}>{message}</H5>
      </Center>
      <Button colorScheme="inverted" onClick={onSubmit}>
        {rating === 5 ? `Rate on ${browserName} store` : "Give Feedback"}
      </Button>
    </Flex>
  )
}
