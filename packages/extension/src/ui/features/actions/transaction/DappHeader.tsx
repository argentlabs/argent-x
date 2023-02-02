import { H5, icons } from "@argent/ui"
import { Box, Center, VStack } from "@chakra-ui/react"
import React, { useMemo } from "react"
import { Call } from "starknet"

import { ApiTransactionReviewResponse } from "../../../../shared/transactionReview.service"
import { titleForTransactions } from "./titleForTransactions"

const { NetworkIcon } = icons

export interface DappHeaderProps {
  transactions: Call | Call[]
  transactionReview?: ApiTransactionReviewResponse
}

export const DappHeader = ({
  transactions,
  transactionReview,
}: DappHeaderProps) => {
  const title = useMemo(() => {
    return titleForTransactions(transactions, transactionReview)
  }, [transactionReview, transactions])

  return (
    <Box mb="4">
      <VStack gap="1">
        <IconWrapper>
          <NetworkIcon fontSize={"4xl"} color="neutrals.500" />
        </IconWrapper>
        <H5>{title}</H5>
      </VStack>
    </Box>
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
