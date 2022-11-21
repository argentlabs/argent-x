import { FC } from "react"
import styled from "styled-components"

import { prettifyTokenAmount } from "../../../../shared/token/price"
import {
  TokenTextGroup,
  TokenTitle,
} from "../../accountTokens/TokenListItemDeprecated"
import { SwapTransaction } from "../transform/type"

export const TokenAmount = styled(TokenTitle)`
  text-align: right;
`

const TokenValue = styled.div`
  text-align: right;
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.text2};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export interface ISwapAccessory {
  transaction: SwapTransaction
}

export const SwapAccessory: FC<ISwapAccessory> = ({ transaction }) => {
  const { fromAmount, fromToken, toAmount, toToken } = transaction
  return (
    <TokenTextGroup>
      <TokenAmount>
        {toToken ? (
          prettifyTokenAmount({
            amount: toAmount,
            decimals: toToken.decimals,
            symbol: toToken.symbol,
          })
        ) : (
          <>{toAmount} Unknown</>
        )}
      </TokenAmount>
      <TokenValue>
        &minus;
        {fromToken ? (
          prettifyTokenAmount({
            amount: fromAmount,
            decimals: fromToken.decimals,
            symbol: fromToken.symbol,
          })
        ) : (
          <>{fromAmount} Unknown</>
        )}
      </TokenValue>
    </TokenTextGroup>
  )
}
