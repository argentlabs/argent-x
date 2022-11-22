import { H6, P4 } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"

import { useDisplayTokenAmountAndCurrencyValue } from "../../accountTokens/useDisplayTokenAmountAndCurrencyValue"
import {
  TokenApproveTransaction,
  TokenMintTransaction,
  TokenTransferTransaction,
} from "../transform/type"

export interface TransferAccessoryProps {
  transaction:
    | TokenTransferTransaction
    | TokenMintTransaction
    | TokenApproveTransaction
}

export const TransferAccessory: FC<TransferAccessoryProps> = ({
  transaction,
}) => {
  const { action, amount, tokenAddress } = transaction
  const { displayAmount, displayValue } = useDisplayTokenAmountAndCurrencyValue(
    { amount, tokenAddress },
  )
  if (!displayAmount) {
    return null
  }
  const prefix =
    action === "SEND" ? <>&minus;</> : action === "RECEIVE" ? <>+</> : null
  return (
    <Flex direction={"column"} overflow="hidden">
      <H6
        overflow="hidden"
        textOverflow={"ellipsis"}
        textAlign={"right"}
        color={action === "RECEIVE" ? "secondary.500" : undefined}
      >
        {prefix}
        {displayAmount}
      </H6>
      {displayValue && (
        <P4
          color="neutrals.400"
          fontWeight={"semibold"}
          overflow="hidden"
          textOverflow={"ellipsis"}
          textAlign={"right"}
        >
          {prefix}
          {displayValue}
        </P4>
      )}
    </Flex>
  )
}
