import { NoShieldSecondaryIcon } from "@argent/x-ui/icons"
import { Button, FlowHeader, P3 } from "@argent/x-ui"
import { Center, Flex, ListItem, OrderedList } from "@chakra-ui/react"
import type { FC } from "react"

import {
  ESCAPE_GUARDIAN_LINK,
  SmartAccountExternalLinkButton,
} from "../ui/SmartAccountExternalLinkButton"
import { getEscapeDisplayAttributes } from "./getEscapeDisplayAttributes"
import type { LiveAccountEscapeProps } from "./useAccountEscape"

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
        icon={NoShieldSecondaryIcon}
        title={title}
        subtitle={
          "You’ve started the process of removing Argent as a guardian.If this wasn’t you, someone may be trying to access your account."
        }
        variant={colorScheme}
      />
      <P3 color="neutrals.100">
        If this wasn’t you we recommend the following steps:
      </P3>
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
