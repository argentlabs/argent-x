import { Button, FlowHeader, P4, iconsDeprecated } from "@argent/x-ui"
import { Center, Flex, ListItem, OrderedList } from "@chakra-ui/react"
import { FC } from "react"

import {
  ESCAPE_GUARDIAN_LINK,
  SmartAccountExternalLinkButton,
} from "../ui/SmartAccountExternalLinkButton"
import { getEscapeDisplayAttributes } from "./EscapeBanner"
import { LiveAccountEscapeProps } from "./useAccountEscape"

const { SmartAccountActiveIcon } = iconsDeprecated

interface EscapeGuardianProps {
  liveAccountEscape: LiveAccountEscapeProps
  onKeep: () => void
  onContinue: () => void
}

export const EscapeGuardian: FC<EscapeGuardianProps> = ({
  liveAccountEscape,
  onKeep,
  onContinue,
}) => {
  const { colorScheme, title } = getEscapeDisplayAttributes(liveAccountEscape)
  return (
    <Flex flexDirection={"column"} flex={1} px={4} pt={8} pb={4}>
      <FlowHeader
        icon={SmartAccountActiveIcon}
        title={title}
        subtitle={
          "An action to remove Argent as a guardian was started. If this wasn’t you, someone could be trying to gain access to your account."
        }
        variant={colorScheme}
      />
      <P4 color="neutrals.100">
        If this wasn’t you we recommend the following steps:
      </P4>
      <OrderedList variant={"bordered"} mt={3}>
        <ListItem>Keep Argent as guardian on your Smart Account</ListItem>
        <ListItem>
          Migrate your funds to an account from a different seed phrase
        </ListItem>
      </OrderedList>
      <Center>
        <SmartAccountExternalLinkButton
          onClick={() => undefined}
          href={ESCAPE_GUARDIAN_LINK}
          my={3}
        >
          Detailed instructions
        </SmartAccountExternalLinkButton>
      </Center>
      <Flex flex={1} />
      <Button
        colorScheme={"primary"}
        onClick={() => {
          onKeep()
        }}
      >
        Keep Argent as guardian
      </Button>
      <Button
        mt={3}
        onClick={() => {
          onContinue()
        }}
      >
        Continue with removal
      </Button>
    </Flex>
  )
}
