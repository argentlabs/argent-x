import { P4, icons } from "@argent/ui"
import {
  Currency,
  Trade,
  basisPointsToPercent,
  tryParseAmount,
  useTradeExactIn,
  useUserState,
} from "@argent/x-swap"
import { Flex, Text, Tooltip } from "@chakra-ui/react"
import { FC, useCallback, useState } from "react"

const { InfoIcon } = icons

const SwapPricesInfo: FC<{
  currencyIn?: Currency | undefined
  currencyOut?: Currency | undefined
  trade: Trade
}> = ({ currencyIn, currencyOut, trade }) => {
  const [isTokenIn, setIsTokenIn] = useState(true)
  const { updateUserSlippageTolerance, userSlippageTolerance } = useUserState()

  const [rateTokenInputTokenOutput, loadingRateTokenInputTokenOutput] =
    useTradeExactIn(tryParseAmount("1", currencyIn), currencyOut)

  const [rateTokenOutputTokenInput, loadingRateTokenOutputTokenInput] =
    useTradeExactIn(tryParseAmount("1", currencyOut), currencyIn)

  const switchRate = useCallback(() => {
    setIsTokenIn(!isTokenIn)
  }, [isTokenIn])

  return (
    <Flex
      flexDirection="column"
      bg="neutrals.900"
      border="solid 1px"
      borderColor="neutrals.700"
      borderRadius="lg"
      w="100%"
      mt="4"
      p="3"
    >
      <Flex justifyContent="space-between">
        <P4 color="neutrals.300">Rate</P4>
        <P4
          fontWeight="bold"
          cursor="pointer"
          _hover={{ color: "accent.500" }}
          onClick={switchRate}
        >
          1 ≈
          {isTokenIn ? (
            <>{rateTokenInputTokenOutput?.executionPrice.toSignificant(6)} </>
          ) : (
            <>{rateTokenOutputTokenInput?.executionPrice.toSignificant(6)}</>
          )}
        </P4>
      </Flex>
      <Flex justifyContent="space-between">
        <P4 color="neutrals.300">
          Min received{" "}
          <Tooltip label="PLACEHOLDER">
            <Text>
              <InfoIcon />
            </Text>
          </Tooltip>
        </P4>
        <P4 fontWeight="bold">
          Slippage {userSlippageTolerance / 100}
          {trade
            .minimumAmountOut(basisPointsToPercent(userSlippageTolerance))
            .toSignificant(6)}
          {currencyOut?.symbol}
        </P4>
      </Flex>
      <Flex justifyContent="space-between">
        <P4 color="neutrals.300">
          Price impact
          <Tooltip label="Difference between the market price and estimated price due to trade size">
            <Text>
              <InfoIcon />
            </Text>
          </Tooltip>
        </P4>
        <P4 fontWeight="bold">{trade.priceImpact.toSignificant(6)}</P4>
      </Flex>
      {/* 
				TODO: Add/decide how to display fees
				<Flex justifyContent="space-between">
					<P4 color="neutrals.300">Estimated fees</P4>
					<P4 fontWeight="bold">TODO</P4>
				</Flex> 
			*/}
    </Flex>
  )
}

export { SwapPricesInfo }
