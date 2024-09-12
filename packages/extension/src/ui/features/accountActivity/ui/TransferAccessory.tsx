import { H6, P4, TextWithAmount } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"

import { useDisplayTokenAmountAndCurrencyValue } from "../../accountTokens/useDisplayTokenAmountAndCurrencyValue"
import {
  TokenApproveTransaction,
  TokenMintTransaction,
  TokenTransferTransaction,
} from "../../../../shared/activity/utils/transform/type"

export interface TransferAccessoryProps {
  transaction:
    | TokenTransferTransaction
    | TokenMintTransaction
    | TokenApproveTransaction
  failed?: boolean
}

export const TransferAccessory: FC<TransferAccessoryProps> = ({
  transaction,
  failed,
}) => {
  const { action, amount, tokenAddress } = transaction
  const { displayAmount, displayValue } = useDisplayTokenAmountAndCurrencyValue(
    { amount, tokenAddress },
  )
  if (!displayAmount) {
    return null
  }
  const isReceive = action === "RECEIVE"
  const prefix = action === "SEND" ? <>&minus;</> : isReceive ? <>+</> : null
  return (
    <Flex direction={"column"} overflow="hidden">
      <TextWithAmount amount={amount}>
        <H6
          overflow="hidden"
          textOverflow={"ellipsis"}
          textAlign={"right"}
          color={isReceive ? "secondary.500" : undefined}
          textDecoration={failed ? "line-through" : undefined}
        >
          {prefix}
          {displayAmount}
        </H6>
      </TextWithAmount>
      {displayValue && (
        <P4
          color="neutrals.400"
          fontWeight={"semibold"}
          overflow="hidden"
          textOverflow={"ellipsis"}
          textAlign={"right"}
          textDecoration={failed ? "line-through" : undefined}
        >
          {prefix}
          {displayValue}
        </P4>
      )}
    </Flex>
  )
}
