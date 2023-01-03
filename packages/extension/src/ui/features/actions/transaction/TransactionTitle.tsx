import { icons } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"
import { Call } from "starknet"

import { isErc20TransferCall } from "../../../../shared/call"
import { getTransactionReviewSwap } from "../../../../shared/transactionReview.service"
import { ApiTransactionReviewResponse } from "../../../../shared/transactionReview.service"

const { ArrowRightIcon } = icons

export interface TransactionTitleProps {
  transactionReview?: ApiTransactionReviewResponse
  fallback?: string
}

export const TransactionTitle: FC<TransactionTitleProps> = ({
  transactionReview,
  fallback = "transaction",
}) => {
  const swapTxn = getTransactionReviewSwap(transactionReview)

  const hasSwap = !!swapTxn

  return hasSwap ? (
    <Flex alignItems="center" gap="1">
      Swap {swapTxn.src?.token.symbol}
      <ArrowRightIcon width="0.7em" height="0.8em" />
      {swapTxn.dst?.token.symbol}
    </Flex>
  ) : (
    <>Confirm {fallback}</>
  )
}
