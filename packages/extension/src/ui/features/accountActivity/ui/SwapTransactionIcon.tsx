import { Square, SquareProps } from "@chakra-ui/react"
import { FC } from "react"

import { TokenIcon } from "../../accountTokens/TokenIcon"
import { isSwapTransaction } from "../transform/is"
import { TransformedTransaction } from "../transform/type"

export interface SwapTransactionIconProps extends Omit<SquareProps, "size"> {
  transaction: TransformedTransaction
  size: string | number
}

export const SwapTransactionIcon: FC<SwapTransactionIconProps> = ({
  transaction,
  size = 18,
  ...rest
}) => {
  if (!isSwapTransaction(transaction)) {
    console.warn("Not a swap transaction")
    return null
  }
  const fromIconSize = Math.round((Number(size) * 24) / 36)
  const toIconSize = Math.round((Number(size) * 28) / 36)
  const { fromToken, toToken } = transaction
  return (
    <Square
      size={size}
      position={"relative"}
      {...rest}
      data-testid="swap-transaction-icon"
    >
      {fromToken && (
        <TokenIcon
          name={fromToken?.name || "?"}
          url={fromToken?.image}
          size={fromIconSize}
          position={"absolute"}
          left={0}
          top={0}
        />
      )}
      <TokenIcon
        name={toToken?.name || "?"}
        url={toToken?.image}
        size={toIconSize}
        position={"absolute"}
        right={0}
        bottom={0}
      />
    </Square>
  )
}
