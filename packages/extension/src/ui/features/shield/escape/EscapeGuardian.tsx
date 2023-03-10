import { Button, P4, icons } from "@argent/ui"
import { Center, Flex, ListItem, OrderedList } from "@chakra-ui/react"
import { FC } from "react"

import { analytics } from "../../../services/analytics"
import { ShieldExternalLinkButton } from "../ui/ShieldExternalLinkButton"
import { ShieldHeader } from "../ui/ShieldHeader"
import { getEscapeDisplayAttributes } from "./EscapeBanner"
import { LiveAccountEscapeProps } from "./useAccountEscape"

const { ArgentShieldIcon } = icons

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
      <ShieldHeader
        icon={ArgentShieldIcon}
        title={title}
        subtitle={
          "An action to remove Argent Shield was started. If this wasn’t you, someone could be trying to gain access to your account."
        }
        variant={colorScheme}
      />
      <P4 color="neutrals.100">
        If you didn’t start this action we recommend taking the following steps:
      </P4>
      <OrderedList variant={"bordered"} mt={3}>
        <ListItem>Keep Argent Shield turned on</ListItem>
        <ListItem>
          Migrate your funds to an account from a different seed phrase
        </ListItem>
      </OrderedList>
      <Center>
        <ShieldExternalLinkButton
          onClick={() => {
            analytics.track("argentShieldEscapeScreenAction", {
              escapeId: "escapeGuardian",
              remainingTime: liveAccountEscape.activeFromNowMs,
              action: "detailedInstructions",
            })
          }}
          href={"https://www.argent.xyz/argent-x/"}
          my={3}
        >
          Detailed instructions
        </ShieldExternalLinkButton>
      </Center>
      <Flex flex={1} />
      <Button
        colorScheme={"primary"}
        onClick={() => {
          analytics.track("argentShieldEscapeScreenAction", {
            escapeId: "escapeGuardian",
            remainingTime: liveAccountEscape.activeFromNowMs,
            action: "keepArgentShield",
          })
          onKeep()
        }}
      >
        Keep Argent Shield
      </Button>
      <Button
        mt={3}
        onClick={() => {
          analytics.track("argentShieldEscapeScreenAction", {
            escapeId: "escapeGuardian",
            remainingTime: liveAccountEscape.activeFromNowMs,
            action: "continueWithRemoval",
          })
          onContinue()
        }}
      >
        Continue with removal
      </Button>
    </Flex>
  )
}
