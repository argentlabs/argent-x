import {
  BarBackButton,
  CellStack,
  L2,
  NavigationContainer,
  P3,
} from "@argent/x-ui"
import { Button, Center, Flex } from "@chakra-ui/react"
import copy from "copy-to-clipboard"
import { useMemo, useState } from "react"

import { QrCode } from "../../../components/QrCode"
import { useNavigateReturnToOrBack } from "../../../hooks/useNavigateReturnTo"
import { usePublicKey } from "../../accounts/usePublicKey"
import { useCurrentNetwork } from "../../networks/hooks/useCurrentNetwork"
import { encodeBase58 } from "@argent/x-shared"
import { useRouteAccountAddress } from "../../../hooks/useRoute"

export const ExportPublicKeyScreen = () => {
  const onBack = useNavigateReturnToOrBack()

  const [publicKeyCopied, setPublicKeyCopied] = useState(false)
  const accountAddress = useRouteAccountAddress()
  const network = useCurrentNetwork()

  const baseAccount = useMemo(
    () =>
      accountAddress
        ? {
            address: accountAddress,
            networkId: network.id,
          }
        : undefined,
    [accountAddress, network.id],
  )

  const publicKey = usePublicKey(baseAccount)

  const encodedPublicKey = useMemo(() => {
    if (!publicKey) {
      return null
    }
    return encodeBase58(publicKey)
  }, [publicKey])

  if (!encodedPublicKey) {
    return null
  }

  const onCopy = () => {
    copy(encodedPublicKey)
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
          <L2>Exporting public key does NOT give access to your funds.</L2>
        </Flex>
        <Center overflow={"hidden"} flexDirection={"column"} gap={6} px={6}>
          <QrCode
            size={208}
            data={encodedPublicKey}
            data-key={encodedPublicKey}
          />
          <P3
            aria-label="Public key"
            textAlign={"center"}
            fontWeight={"semibold"}
            w={"full"}
          >
            {encodedPublicKey}
          </P3>
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
