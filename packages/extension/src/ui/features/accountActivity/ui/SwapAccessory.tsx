import { H6, P4, TextWithAmount } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"

import { prettifyTokenAmount } from "@argent/x-shared"
import { SwapTransaction } from "../transform/type"

export interface SwapAccessoryProps {
  transaction: SwapTransaction
  failed?: boolean
}

export const SwapAccessory: FC<SwapAccessoryProps> = ({
  transaction,
  failed,
}) => {
  const { fromAmount, fromToken, toAmount, toToken } = transaction
  return (
    <Flex direction={"column"} overflow="hidden">
      <TextWithAmount amount={toAmount} decimals={toToken.decimals}>
        <H6
          overflow="hidden"
          textOverflow={"ellipsis"}
          textAlign={"right"}
          color={"secondary.500"}
          textDecoration={failed ? "line-through" : undefined}
        >
          <>+</>
          {toToken ? (
            prettifyTokenAmount({
              amount: toAmount,
              decimals: toToken.decimals,
              symbol: toToken.symbol,
            })
          ) : (
            <>{toAmount} Unknown</>
          )}
        </H6>
      </TextWithAmount>
      <TextWithAmount amount={fromAmount} decimals={fromToken.decimals}>
        <P4
          color="neutrals.400"
          fontWeight={"semibold"}
          overflow="hidden"
          textOverflow={"ellipsis"}
          textAlign={"right"}
          textDecoration={failed ? "line-through" : undefined}
        >
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
        </P4>
      </TextWithAmount>
    </Flex>
  )
}
