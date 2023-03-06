import { H6, P4, TextWithAmount } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"

import { prettifyTokenAmount } from "../../../../shared/token/price"
import { SwapTransaction } from "../transform/type"

export interface SwapAccessoryProps {
  transaction: SwapTransaction
}

export const SwapAccessory: FC<SwapAccessoryProps> = ({ transaction }) => {
  const { fromAmount, fromToken, toAmount, toToken } = transaction
  return (
    <Flex direction={"column"} overflow="hidden">
      <TextWithAmount amount={toAmount} decimals={toToken.decimals}>
        <H6
          overflow="hidden"
          textOverflow={"ellipsis"}
          textAlign={"right"}
          color={"secondary.500"}
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
