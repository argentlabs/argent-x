import { H5, icons } from "@argent/ui"
import { Box, Center, VStack } from "@chakra-ui/react"
import React, { useMemo } from "react"
import { Call } from "starknet"

import { ApiTransactionReviewResponse } from "../../../../shared/transactionReview.service"
import { titleForTransactions } from "./titleForTransactions"

const { UnknownDappIcon } = icons

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
    <Box my="6">
      <VStack gap="1">
        <IconWrapper>
          <UnknownDappIcon color="#58585B" />
        </IconWrapper>
        <H5>{title}</H5>
      </VStack>
    </Box>
  )
}

const IconWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      w="14"
      h="14"
      background="neutrals.700"
      borderRadius="2xl"
      boxShadow="0px 4px 20px rgba(0, 0, 0, 0.5);"
    >
      <Center justifyContent="center" alignItems="center" height="full">
        {children}
      </Center>
    </Box>
  )
}
