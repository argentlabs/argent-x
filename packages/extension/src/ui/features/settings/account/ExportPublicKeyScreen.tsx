import {
  BarBackButton,
  CellStack,
  L2Bold,
  NavigationContainer,
  P2,
} from "@argent/x-ui"
import { Button, Center, Flex } from "@chakra-ui/react"
import copy from "copy-to-clipboard"
import { useState } from "react"

import { QrCode } from "../../../components/QrCode"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { usePublicKey } from "../../accounts/usePublicKey"
import { useRouteAccountId } from "../../../hooks/useRoute"

export const ExportPublicKeyScreen = () => {
  const onBack = useNavigateReturnToOrBack()

  const [publicKeyCopied, setPublicKeyCopied] = useState(false)
  const accountId = useRouteAccountId()

  const publicKey = usePublicKey(accountId)

  if (!publicKey) {
    return null
  }

  const onCopy = () => {
    copy(publicKey)
    setPublicKeyCopied(true)
    setTimeout(() => {
      setPublicKeyCopied(false)
    }, 3000)
  }
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={"Export public key"}
    >
      <CellStack>
        <Flex
          rounded={"xl"}
          textAlign={"center"}
          px={3}
          py={2.5}
          bg={"surface-info-default"}
          color={"accent-blue"}
          mb={4}
        >
          <L2Bold>
            Exporting public key does NOT give access to your funds.
          </L2Bold>
        </Flex>
        <Center overflow={"hidden"} flexDirection={"column"} gap={6} px={6}>
          <QrCode size={208} data={publicKey} data-key={publicKey} />
          <P2
            aria-label="Public key"
            textAlign={"center"}
            fontWeight={"semibold"}
            w={"full"}
          >
            {publicKey}
          </P2>
        </Center>
        <Button
          mt={3}
          colorScheme={publicKeyCopied ? "inverted" : undefined}
          size={"sm"}
          mx={"auto"}
          onClick={onCopy}
        >
          {publicKeyCopied ? "Copied" : "Copy"}
        </Button>
      </CellStack>
    </NavigationContainer>
  )
}
