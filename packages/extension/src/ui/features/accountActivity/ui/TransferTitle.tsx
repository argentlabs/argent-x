import { BigNumberish } from "starknet"
import { FC } from "react"
import styled from "styled-components"

import { useDisplayTokenAmountAndCurrencyValue } from "../../accountTokens/useDisplayTokenAmountAndCurrencyValue"
import { TransformedTransactionAction } from "../../../../shared/activity/utils/transform/type"

const TitleCurrencyValue = styled.span`
  font-size: 17px;
  font-weight: 600;
  color: ${({ theme }) => theme.text2};
`
interface ITransferTitle {
  action: TransformedTransactionAction
  amount: BigNumberish
  tokenAddress: string
  fallback?: string
}

export const TransferTitle: FC<ITransferTitle> = ({
  action,
  amount,
  tokenAddress,
  fallback,
}) => {
  const { displayAmount, displayValue } = useDisplayTokenAmountAndCurrencyValue(
    { amount, tokenAddress },
  )
  if (!displayAmount) {
    return <>{fallback}</>
  }
  const prefix = action === "SEND" ? <>&minus;</> : ""
  return (
    <>
      {prefix}
      {displayAmount}
      {displayValue && (
        <TitleCurrencyValue>
          {" "}
          ({prefix}
          {displayValue})
        </TitleCurrencyValue>
      )}
    </>
  )
}
