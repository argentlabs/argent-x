import { P4, icons } from "@argent/ui"
import {
  Currency,
  ONE_BIPS,
  Trade,
  basisPointsToPercent,
  computeTradePriceBreakdown,
  formatExecutionPriceWithFee,
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

const SwapPricesInfo: FC<SwapPricesInfoProps> = ({ currencyOut, trade }) => {
  const [inverted, setInverted] = useState(false)
  const [showSlippageForm, setShowSlippageForm] = useState(false)
  const { userSlippageTolerance } = useUserState()
  const { priceImpactWithoutFee: priceImpact } =
    computeTradePriceBreakdown(trade)

  const switchRate = useCallback(() => {
    setInverted(!inverted)
  }, [inverted])

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
          <Flex alignItems="center" gap="1">
            <P4 color="neutrals.300">Rate</P4>
            <Tooltip label="Includes Jediswap's 0.3% protocol fee">
              <Text color="neutrals.300" cursor="pointer">
                <InfoIcon />
              </Text>
            </Tooltip>
          </Flex>
          <P4
            fontWeight="bold"
            cursor="pointer"
            _hover={{ color: "accent.500" }}
            onClick={switchRate}
          >
            {formatExecutionPriceWithFee(trade, inverted, "≈")}
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
                <P4 fontWeight="500" color="neutrals.300">
                  Slippage {userSlippageTolerance / 100}%
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
          <P4 fontWeight="bold">
            {priceImpact
              ? priceImpact.lessThan(ONE_BIPS)
                ? "<0.01%"
                : `${priceImpact.toFixed(2)}%`
              : "-"}
          </P4>
        </Flex>
        {/** Keeping this here, might be useful in future. }
         <Flex justifyContent="space-between">
          <Flex alignItems="center" gap="1">
            <P4 color="neutrals.300">Estimated Fees</P4>
            <Tooltip label="A portion of each trade (0.30%) goes to JediSwap liquidity providers as a protocol incentive">
              <Text color="neutrals.300" cursor="pointer">
                <InfoIcon />
              </Text>
            </Tooltip>
          </Flex>
          <P4 fontWeight="bold">TODO</P4>
        </Flex> */}
      </Flex>
    </>
  )
}

export { SwapPricesInfo }
