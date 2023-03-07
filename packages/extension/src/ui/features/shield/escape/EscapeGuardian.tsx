import { Button, P3, P4, icons } from "@argent/ui"
import { Center, Flex, ListItem, OrderedList } from "@chakra-ui/react"
import { FC } from "react"

import { ESCAPE_SECURITY_PERIOD_DAYS } from "../../../../shared/account/details/getEscape"
import { ShieldExternalLinkButton } from "../ui/ShieldExternalLinkButton"
import { ShieldHeader } from "../ui/ShieldHeader"
import { getEscapeDisplayAttributes } from "./EscapeBanner"
import { LiveAccountEscapeProps } from "./useAccountEscape"

const { ArgentShieldIcon, ArgentShieldDeactivateIcon } = icons

interface EscapeGuardianProps {
  liveAccountEscape: LiveAccountEscapeProps
  onKeep: () => void
  onContinue: () => void
  onRemove: () => void
}

export const EscapeGuardian: FC<EscapeGuardianProps> = ({
  liveAccountEscape,
  onKeep,
  onContinue,
  onRemove,
}) => {
  const { activeFromNowMs } = liveAccountEscape
  const { colorScheme, title } = getEscapeDisplayAttributes(liveAccountEscape)
  const isReady = activeFromNowMs === 0
  return (
    <Flex flexDirection={"column"} flex={1} px={4} pt={8} pb={4}>
      {isReady ? (
        <>
          <ShieldHeader
            icon={ArgentShieldDeactivateIcon}
            title={"Ready to remove Argent Shield"}
            subtitle={`The ${ESCAPE_SECURITY_PERIOD_DAYS}-day security period is over. You can now remove Argent Shield instantly`}
            variant={colorScheme}
          />
          <P3 color="neutrals.100" textAlign={"center"}>
            <strong>
              2 transactions will be required to remove Argent Shield
            </strong>
          </P3>
          <Flex flex={1} />
          <Button colorScheme={"primary"} onClick={onRemove}>
            Remove Argent Shield
          </Button>
        </>
      ) : (
        <>
          <ShieldHeader
            icon={ArgentShieldIcon}
            title={title}
            subtitle={
              "An action to remove Argent Shield was started. If this wasn’t you, someone could be trying to gain access to your account."
            }
            variant={colorScheme}
          />
          <P4 color="neutrals.100">
            If you didn’t start this action we recommend taking the following
            steps:
          </P4>
          <OrderedList variant={"bordered"} mt={3}>
            <ListItem>Keep Argent Shield turned on</ListItem>
            <ListItem>
              Migrate your funds to an account from a different seed phrase
            </ListItem>
          </OrderedList>
          <Center>
            <ShieldExternalLinkButton
              href={"https://www.argent.xyz/argent-x/"}
              my={3}
            >
              Detailed instructions
            </ShieldExternalLinkButton>
          </Center>
          <Flex flex={1} />
          <Button colorScheme={"primary"} onClick={onKeep}>
            Keep Argent Shield
          </Button>
          <Button mt={3} onClick={onContinue}>
            Continue with removal
          </Button>
        </>
      )}
    </Flex>
  )
}
