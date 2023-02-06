import { icons } from "@argent/ui"
import { Box, Center, Image } from "@chakra-ui/react"
import { FC, useMemo } from "react"

import { useToken } from "../../../../shared/tokens.state"
import { getTransactionReviewSwap } from "../../../../shared/transactionReview.service"
import { ApiTransactionReviewResponse } from "../../../../shared/transactionReview.service"
import { useCurrentNetwork } from "../../networks/useNetworks"

const { NetworkIcon } = icons

export interface TransactionIconProps {
  transactionReview?: ApiTransactionReviewResponse
}

export const TransactionIcon: FC<TransactionIconProps> = ({
  transactionReview,
}) => {
  const network = useCurrentNetwork()

  const swapTxn = useMemo(
    () => getTransactionReviewSwap(transactionReview),
    [transactionReview],
  )

  const hasSwap = !!swapTxn

  const srcToken = useToken({
    address: swapTxn?.activity?.src?.token.address || "0x0",
    networkId: network.id,
  })

  const dstToken = useToken({
    address: swapTxn?.activity?.dst?.token.address || "0x0",
    networkId: network.id,
  })

  return hasSwap ? (
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
  ) : (
    <IconWrapper>
      <NetworkIcon fontSize={"4xl"} color="neutrals.500" />
    </IconWrapper>
  )
}

const IconWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Center
      w="14"
      h="14"
      background="neutrals.700"
      borderRadius="2xl"
      boxShadow="menu"
    >
      {children}
    </Center>
  )
}
