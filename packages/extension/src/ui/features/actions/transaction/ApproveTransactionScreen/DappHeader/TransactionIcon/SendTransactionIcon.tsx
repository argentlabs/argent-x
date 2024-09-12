import { iconsDeprecated } from "@argent/x-ui"
import { Box, Center, Image } from "@chakra-ui/react"

import { AggregatedSimData } from "@argent/x-shared"
import { useMemo } from "react"
import { Network } from "../../../../../../../shared/network"
import { UnknownTokenIcon } from "./UnknownTokenIcon"
import { useToken } from "../../../../../accountTokens/tokens.state"

const { SendIcon } = iconsDeprecated

export const SendTransactionIcon = ({
  aggregatedData,
  network,
}: {
  aggregatedData?: AggregatedSimData[]
  network: Network
}) => {
  const srcAddress = useMemo(
    () => aggregatedData?.find((ag) => ag.recipients.length > 0)?.token.address,
    [aggregatedData],
  )

  const srcToken = useToken({
    address: srcAddress || "0x0",
    networkId: network.id,
  })

  return (
    <Center data-testid="send-transaction-icon">
      <Box height="14" width="14" position="relative">
        <Center
          w="14"
          h="14"
          background="neutrals.600"
          borderRadius="90"
          boxShadow="menu"
          padding="4"
        >
          <SendIcon fontSize={"4xl"} color="white" />
          {srcToken ? (
            <Center
              w="28px"
              h="28px"
              background="neutrals.900"
              borderRadius="90"
              boxShadow="menu"
              padding="1"
              position="absolute"
              zIndex="1"
              right="-1"
              bottom="-1"
            >
              <Image src={srcToken?.iconUrl} height="5" width="5" zIndex="2" />
            </Center>
          ) : (
            <UnknownTokenIcon
              w="28px"
              h="28px"
              background="neutrals.900"
              borderRadius="90"
              boxShadow="menu"
              padding="1"
              position="absolute"
              zIndex="1"
              right="-1"
              bottom="-1"
            />
          )}
        </Center>
      </Box>
    </Center>
  )
}
