import { P4, icons } from "@argent/ui"
import {
  Currency,
  Trade,
  basisPointsToPercent,
  tryParseAmount,
  useTradeExactIn,
  useUserState,
} from "@argent/x-swap"
import { Box, Flex, Text, Tooltip } from "@chakra-ui/react"
import { FC, useCallback, useState } from "react"

import { SlippageForm } from "./SlippageForm"

const { InfoIcon, SettingsIcon } = icons

interface SwapPricesInfoProps {
  currencyIn?: Currency
  currencyOut?: Currency
  trade: Trade
}

const SwapPricesInfo: FC<SwapPricesInfoProps> = ({
  currencyIn,
  currencyOut,
  trade,
}) => {
  const [isTokenIn, setIsTokenIn] = useState(true)
  const [showSlippageForm, setShowSlippageForm] = useState(false)
  const { userSlippageTolerance } = useUserState()

  const [rateTokenInputTokenOutput, loadingRateTokenInputTokenOutput] =
    useTradeExactIn(tryParseAmount("1", currencyIn), currencyOut)

  const [rateTokenOutputTokenInput, loadingRateTokenOutputTokenInput] =
    useTradeExactIn(tryParseAmount("1", currencyOut), currencyIn)

  const switchRate = useCallback(() => {
    setIsTokenIn(!isTokenIn)
  }, [isTokenIn])

  const showSlippage = useCallback(() => {
    setShowSlippageForm(!showSlippageForm)
  }, [showSlippageForm])

  return (
    <>
      <Flex
        flexDirection="column"
        bg="neutrals.900"
        border="solid 1px"
        borderColor="neutrals.700"
        borderRadius="lg"
        w="100%"
        mt="4"
        p="3"
        gap="3"
      >
        <Flex justifyContent="space-between">
          <P4 color="neutrals.300">Rate</P4>
          <P4
            fontWeight="bold"
            cursor="pointer"
            _hover={{ color: "accent.500" }}
            onClick={switchRate}
          >
            1 ≈{" "}
            {isTokenIn ? (
              <>{rateTokenInputTokenOutput?.executionPrice.toSignificant(6)} </>
            ) : (
              <>{rateTokenOutputTokenInput?.executionPrice.toSignificant(6)}</>
            )}
          </P4>
        </Flex>
        <Flex justifyContent="space-between">
          <Flex alignItems="center" gap="1">
            <P4 color="neutrals.300">Min received</P4>
            <Tooltip label="The minimum amount of tokens you're guaranteed to receive given the slippage percentage">
              <Text color="neutrals.300" cursor="pointer">
                <InfoIcon />
              </Text>
            </Tooltip>
          </Flex>
          <Flex gap={2}>
            <Box position="relative">
              <Flex
                cursor="pointer"
                _hover={{ color: "accent.500" }}
                gap="1"
                alignItems="center"
                onClick={showSlippage}
              >
                <SettingsIcon />
                <P4 fontWeight="bold">
                  Slippage {userSlippageTolerance / 100}
                </P4>
              </Flex>
              {showSlippageForm && <SlippageForm closeHandler={showSlippage} />}
            </Box>
            <P4 fontWeight="bold">
              {trade
                .minimumAmountOut(basisPointsToPercent(userSlippageTolerance))
                .toSignificant(6)}
              {currencyOut?.symbol}
            </P4>
          </Flex>
        </Flex>
        <Flex justifyContent="space-between">
          <Flex alignItems="center" gap="1">
            <P4 color="neutrals.300">Price impact</P4>
            <Tooltip label="Difference between the market price and estimated price due to trade size">
              <Text color="neutrals.300" cursor="pointer">
                <InfoIcon />
              </Text>
            </Tooltip>
          </Flex>
          <P4 fontWeight="bold">{trade.priceImpact.toSignificant(6)}%</P4>
        </Flex>
        {/* 
				TODO: Add/decide how to display fees
				<Flex justifyContent="space-between">
					<P4 color="neutrals.300">Estimated fees</P4>
					<P4 fontWeight="bold">TODO</P4>
				</Flex> 
			*/}
      </Flex>
    </>
  )
}

export { SwapPricesInfo }
