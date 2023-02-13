import { H5, P4 } from "@argent/ui"
import { Box, Flex } from "@chakra-ui/react"
import { useMemo } from "react"
import { Call } from "starknet"

import { ApiTransactionReviewResponse } from "../../../../shared/transactionReview.service"
import { TransactionIcon } from "./TransactionIcon"
import { TransactionTitle } from "./TransactionTitle"

export interface DappHeaderProps {
  transactions: Call[]
  transactionReview?: ApiTransactionReviewResponse
}

export const DappHeader = ({
  transactions,
  transactionReview,
}: DappHeaderProps) => {
  const targetedDappWebsite = useMemo(
    () =>
      transactionReview?.targetedDapp?.links.find((l) => l.name === "website"),
    [transactionReview?.targetedDapp?.links],
  )

  return (
    <Box mb="6">
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
