import { Box, Center, Image } from "@chakra-ui/react"

import { Network } from "../../../../../../../shared/network"
import { TransactionReviewWithType } from "../../../../../../../shared/transactionReview.service"
import { useToken } from "../../../../../accountTokens/tokens.state"

export const SwapTransactionIcon = ({
  transaction,
  network,
}: {
  transaction: TransactionReviewWithType
  network: Network
}) => {
  const srcToken = useToken({
    address: transaction?.activity?.src?.token.address || "0x0",
    networkId: network.id,
  })

  const dstToken = useToken({
    address: transaction?.activity?.dst?.token.address || "0x0",
    networkId: network.id,
  })
  return (
    <Center>
      <Box height="14" width="14" position="relative">
        <Image
          src={srcToken?.image}
          height="9"
          width="9"
          position="absolute"
          zIndex="1"
          top="0"
          left="0"
        />
        <Image
          src={dstToken?.image}
          height="10"
          width="10"
          position="absolute"
          zIndex="2"
          bottom="0"
          right="0"
        />
      </Box>
    </Center>
  )
}
