import { H5, P4, icons } from "@argent/ui"
import { Box, Center, Flex, Stack, VStack } from "@chakra-ui/react"
import React, { useMemo } from "react"
import { Call } from "starknet"

import { ApiTransactionReviewResponse } from "../../../../shared/transactionReview.service"
import { TransactionIcon } from "./TransactionIcon"
import { TransactionTitle } from "./TransactionTitle"

const { UnknownDappIcon } = icons

export interface DappHeaderProps {
  transactions: Call[]
  transactionReview?: ApiTransactionReviewResponse
}

export const DappHeader = ({
  transactions,
  transactionReview,
}: DappHeaderProps) => {
  console.log(
    "🚀 ~ file: DappHeader.tsx:21 ~ transactionReview",
    transactionReview,
  )

  const targetedDappWebsite = useMemo(
    () =>
      transactionReview?.targetedDapp?.links.find((l) => l.name === "website"),
    [transactionReview?.targetedDapp?.links],
  )

  return (
    <Box my="6">
      <Flex
        direction="column"
        justifyContent="center"
        alignItems="center"
        gap="3"
      >
        <TransactionIcon transactionReview={transactionReview} />
        <Flex
          direction="column"
          justifyContent="center"
          alignItems="center"
          gap="0.5"
        >
          <H5>
            <TransactionTitle
              transactionReview={transactionReview}
              fallback={
                transactions.length > 1 ? "transactions" : "transaction"
              }
            />
          </H5>
          {targetedDappWebsite && (
            <P4 color="neutrals.300" sx={{ marginTop: 0 }}>
              {targetedDappWebsite.url}
            </P4>
          )}
        </Flex>
      </Flex>
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
