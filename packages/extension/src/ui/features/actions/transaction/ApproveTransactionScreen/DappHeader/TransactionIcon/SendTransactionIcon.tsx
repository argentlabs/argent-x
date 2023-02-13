import { icons } from "@argent/ui"
import { Box, Center, Image } from "@chakra-ui/react"

import { Network } from "../../../../../../../shared/network"
import { TransactionReviewWithType } from "../../../../../../../shared/transactionReview.service"
import { useToken } from "../../../../../accountTokens/tokens.state"

const { SendIcon } = icons

export const SendTransactionIcon = ({
  transaction,
  network,
}: {
  transaction: TransactionReviewWithType
  network: Network
}) => {
  const srcToken = useToken({
    address: transaction?.activity?.value?.token.address || "0x0",
    networkId: network.id,
  })
  return (
    <Center>
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
          {/* // what's the fallback token image ?  */}
          {srcToken && (
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
              <Image src={srcToken?.image} height="5" width="5" zIndex="2" />
            </Center>
          )}
        </Center>
      </Box>
    </Center>
  )
}
