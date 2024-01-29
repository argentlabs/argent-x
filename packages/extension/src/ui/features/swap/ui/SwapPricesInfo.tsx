import { L1, P4, icons } from "@argent/ui"
import { Box, Flex, Text, Tooltip, useDisclosure } from "@chakra-ui/react"
import { FC, useCallback, useMemo, useState } from "react"
import {
  formatExecutionPrice,
  minimumAmountOutFromTrade,
} from "../utils/prices"
import { Token } from "../../../../shared/token/__new/types/token.model"
import { useUserState } from "../state/user"
import { getProvidersFromTradeRoute } from "../utils"
import { prettifyTokenAmount } from "../../../../shared/token/price"
import { SlippageModal } from "./SlippageModal"
import { Trade } from "../../../../shared/swap/model/trade.model"

const { InfoIcon, EditIcon } = icons

interface SwapPricesInfoProps {
  tokenIn?: Token
  tokenOut?: Token
  trade: Trade
}

export const SwapPricesInfo: FC<SwapPricesInfoProps> = ({
  tokenOut,
  trade,
}) => {
  const [inverted, setInverted] = useState(false)
  const { userSlippageTolerance } = useUserState()
  const switchRate = useCallback(() => {
    setInverted(!inverted)
  }, [inverted])

  const {
    isOpen: isSlippageModalOpen,
    onOpen: onOpenSlippageModal,
    onClose: onCloseSlippageModal,
  } = useDisclosure()

  const prettifiedMinReceived = useMemo(() => {
    const { value, decimals } = minimumAmountOutFromTrade(
      trade,
      userSlippageTolerance,
    )

    return prettifyTokenAmount({
      amount: value,
      decimals,
      symbol: tokenOut?.symbol,
    })
  }, [trade, userSlippageTolerance, tokenOut?.symbol])

  const executionPrice = useMemo(
    /** Execution price taking fees into account */
    () => formatExecutionPrice({ trade, inverted, includeFee: false }),
    [trade, inverted],
  )

  return (
    <>
      <Flex
        flexDirection="column"
        bg="neutrals.900"
        border="solid 1px"
        borderColor="neutrals.700"
        borderRadius="lg"
        w="100%"
        mt="2"
        p="3"
        gap="3"
        data-testid="swap-prices-info"
      >
        <Flex justifyContent="space-between">
          <Flex alignItems="center" gap="1">
            <P4 color="neutrals.300">Min received (incl. fees) </P4>
            <Tooltip label="The minimum amount of tokens you're guaranteed to receive given the slippage percentage">
              <Text color="neutrals.300" cursor="pointer">
                <InfoIcon />
              </Text>
            </Tooltip>
          </Flex>
          <P4 fontWeight="bold">{prettifiedMinReceived}</P4>
        </Flex>
        <Flex justifyContent="space-between">
          <Flex alignItems="center" gap="1">
            <P4 color="neutrals.300">Rate</P4>
          </Flex>
          <P4
            fontWeight="bold"
            cursor="pointer"
            _hover={{ color: "accent.500" }}
            onClick={switchRate}
          >
            {executionPrice}
          </P4>
        </Flex>
        <Flex justifyContent="space-between">
          <Flex alignItems="center" gap="1">
            <P4 color="neutrals.300">Max Slippage</P4>
            <Tooltip label="Maximum allowed slippage for the trade">
              <Text color="neutrals.300" cursor="pointer">
                <InfoIcon />
              </Text>
            </Tooltip>
          </Flex>
          <Box position="relative">
            <Flex
              cursor="pointer"
              _hover={{ color: "accent.500" }}
              gap="2"
              alignItems="center"
              onClick={onOpenSlippageModal}
            >
              <EditIcon />
              <P4 fontWeight="500">{userSlippageTolerance / 100}%</P4>
            </Flex>
          </Box>
        </Flex>
        <Flex justifyContent="space-between">
          <P4 color="neutrals.300">Providers</P4>
          <P4 fontWeight="bold">
            {getProvidersFromTradeRoute(trade.route).join(", ")}
          </P4>
        </Flex>
      </Flex>

      <SlippageModal
        isOpen={isSlippageModalOpen}
        onClose={onCloseSlippageModal}
      />
    </>
  )
}

const HighPriceImpactLabel = () => {
  return (
    <Flex direction="column" gap="4px" width="180px">
      <L1>High Price Impact</L1>
      <P4 color="neutrals.100">
        This trade will result in you receiving significantly less than the
        amount being sold
      </P4>
    </Flex>
  )
}
