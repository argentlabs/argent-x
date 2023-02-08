import { Button, P4, icons } from "@argent/ui"
import { Flex, ListItem, OrderedList } from "@chakra-ui/react"
import { FC } from "react"

import { ShieldExternalLinkButton } from "../ui/ShieldExternalLinkButton"
import { ShieldHeader } from "../ui/ShieldHeader"
import { getEscapeDisplayAttributes } from "./EscapeBanner"
import { LiveAccountEscapeProps } from "./useAccountEscape"

const { AlertIcon } = icons

interface EscapeSignerProps {
  liveAccountEscape: LiveAccountEscapeProps
  onRemove: () => void
}

export const EscapeSigner: FC<EscapeSignerProps> = ({
  liveAccountEscape,
  onRemove,
}) => {
  const { colorScheme, title } = getEscapeDisplayAttributes(liveAccountEscape)
  return (
    <Flex flexDirection={"column"} flex={1} px={4} pt={8} pb={4}>
      <ShieldHeader
        icon={AlertIcon}
        title={title}
        subtitle={"This account will be controlled by another key."}
        variant={colorScheme}
      />
      <P4 color="neutrals.400">
        If you don’t recognize this action, it’s likely that Argent Shield is
        compromised. We recommend taking the following steps:
      </P4>
      <OrderedList variant={"bordered"} mt={3}>
        <ListItem>
          Remove Argent Shield within 5 days (you will see an ongoing message in
          Argent X)
        </ListItem>
        <ListItem>Wait 7 days to access your now safe-to-use account</ListItem>
      </OrderedList>
      <ShieldExternalLinkButton
        href={"https://www.argent.xyz/argent-x/"}
        my={3}
      >
        Detailed instructions
      </ShieldExternalLinkButton>
      <Flex flex={1} />
      <Button colorScheme={"primary"} onClick={onRemove}>
        Start Argent Shield removal process
      </Button>
    </Flex>
  )
}
