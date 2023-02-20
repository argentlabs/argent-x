import { Box, Center, Image, SystemStyleObject } from "@chakra-ui/react"

import { Network } from "../../../../../../../shared/network"
import { ApiTransactionReview } from "../../../../../../../shared/transactionReview.service"
import { useToken } from "../../../../../accountTokens/tokens.state"
import { UnknownTokenIcon } from "./UnknownTokenIcon"

export const SwapTransactionIcon = ({
  transaction,
  network,
}: {
  transaction: ApiTransactionReview
  network: Network
}) => {
  const srcToken = useToken({
    address: transaction.activity?.src?.token.address || "0x0",
    networkId: network.id,
  })

  const dstToken = useToken({
    address: transaction.activity?.dst?.token.address || "0x0",
    networkId: network.id,
  })
  const token1Styling: SystemStyleObject = {
    height: "9",
    width: "9",
    position: "absolute",
    zIndex: "1",
    top: "0",
    left: "0",
  }

  const token2Styling: SystemStyleObject = {
    height: "10",
    width: "10",
    position: "absolute",
    zIndex: "2",
    bottom: "0",
    right: "0",
  }

  return (
    <Center data-testid="swap-transaction-icon">
      <Box height="14" width="14" position="relative">
        {srcToken?.image ? (
          <Image src={srcToken.image} sx={token1Styling} />
        ) : (
          <UnknownTokenIcon sx={token1Styling} />
        )}
        {dstToken?.image ? (
          <Image src={dstToken.image} sx={token2Styling} />
        ) : (
          <UnknownTokenIcon sx={token2Styling} />
        )}
      </Box>
    </Center>
  )
}
