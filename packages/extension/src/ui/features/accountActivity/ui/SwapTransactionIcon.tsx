import { Circle, Square, SquareProps } from "@chakra-ui/react"
import { FC } from "react"
import { iconsDeprecated, TokenIcon } from "@argent/x-ui"

import { isSwapTransaction } from "../../../../shared/activity/utils/transform/is"
import { TransformedTransaction } from "../../../../shared/activity/utils/transform/type"
import { ActivityTransactionFailureReason } from "../../../../shared/activity/utils/transform/getTransactionFailureReason"

const { FailIcon } = iconsDeprecated

export interface SwapTransactionIconProps extends Omit<SquareProps, "size"> {
  transaction: TransformedTransaction
  size: string | number
  failureReason?: ActivityTransactionFailureReason
}

export const SwapTransactionIcon: FC<SwapTransactionIconProps> = ({
  transaction,
  size = 18,
  failureReason,
  ...rest
}) => {
  if (!isSwapTransaction(transaction)) {
    console.warn("Not a swap transaction")
    return null
  }
  const fromIconSize = Math.round((Number(size) * 24) / 36)
  const toIconSize = Math.round((Number(size) * 28) / 36)
  const { fromToken, toToken } = transaction

  if (failureReason) {
    const iconSize = Math.round((4 * (Number(size) * 16)) / 36)
    return (
      <Circle
        size={size}
        position={"relative"}
        bg={"neutrals.600"}
        fontSize={iconSize}
        {...rest}
      >
        <FailIcon />
      </Circle>
    )
  }

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
          url={fromToken?.iconUrl}
          size={fromIconSize}
          position={"absolute"}
          left={0}
          top={0}
        />
      )}
      <TokenIcon
        name={toToken?.name || "?"}
        url={toToken?.iconUrl}
        size={toIconSize}
        position={"absolute"}
        right={0}
        bottom={0}
      />
    </Square>
  )
}
