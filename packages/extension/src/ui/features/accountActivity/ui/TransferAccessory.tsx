import { FC } from "react"
import styled from "styled-components"

import {
  TokenTextGroup,
  TokenTitle,
} from "../../accountTokens/TokenListItemDeprecated"
import { useDisplayTokenAmountAndCurrencyValue } from "../../accountTokens/useDisplayTokenAmountAndCurrencyValue"
import {
  TokenApproveTransaction,
  TokenMintTransaction,
  TokenTransferTransaction,
} from "../transform/type"

export const TokenAmount = styled(TokenTitle)`
  text-align: right;
`

const TokenValue = styled.div`
  text-align: right;
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.text2};
  margin: 0;
`

export interface ITransferAccessory {
  transaction:
    | TokenTransferTransaction
    | TokenMintTransaction
    | TokenApproveTransaction
}

export const TransferAccessory: FC<ITransferAccessory> = ({ transaction }) => {
  const { action, amount, tokenAddress } = transaction
  const { displayAmount, displayValue } = useDisplayTokenAmountAndCurrencyValue(
    { amount, tokenAddress },
  )
  if (!displayAmount) {
    return null
  }
  const prefix = action === "SEND" ? <>&minus;</> : ""
  return (
    <TokenTextGroup>
      <TokenAmount>
        {prefix}
        {displayAmount}
      </TokenAmount>
      {displayValue && (
        <TokenValue>
          {prefix}
          {displayValue}
        </TokenValue>
      )}
    </TokenTextGroup>
  )
}
