import { Box, Divider, Flex, HStack, Spinner } from "@chakra-ui/react"
import type { FC } from "react"
import { useCallback, useMemo, useState } from "react"
import type { Trade } from "../../../../shared/swap/model/trade.model"
import { formatExecutionPrice } from "../utils/prices"
import { SwapProviders } from "./SwapProviders"
import { P4, CellStack, P4Bold, H5 } from "@argent/x-ui"
import { SwitchPrimaryIcon } from "@argent/x-ui/icons"

interface SwapPricesInfoProps {
  trade?: Trade
  isLoading?: boolean
}

export const SwapPricesInfo: FC<SwapPricesInfoProps> = ({
  trade,
  isLoading,
}) => {
  const [inverted, setInverted] = useState(false)
  const switchRate = useCallback(() => {
    setInverted(!inverted)
  }, [inverted])

  const executionPrice = useMemo(
    /** Execution price taking fees into account */
    () => formatExecutionPrice({ trade, inverted, includeFee: false }),
    [trade, inverted],
  )

  if (!isLoading && !trade) return null

  return (
    <Box
      w="full"
      borderRadius="12px"
      border="1px solid"
      borderColor="800"
      boxShadow="elevated"
      bgColor="surface-elevated"
      data-testid="swap-prices-info"
    >
      {isLoading && (
        <HStack
          gap={3}
          height={"50px"}
          px="4"
          justifyContent="space-between"
          data-testid="swap-trade-loading"
        >
          <P4 color="text-secondary">Fetching quote</P4>
          <Spinner size="xs" />
        </HStack>
      )}
      {!isLoading && trade && (
        <CellStack gap={0} p={0}>
          {trade?.route && <SwapProviders tradeRoute={trade.route} />}
          <Divider bg="stroke-default" height="2px" borderBottomWidth={0} />
          <HStack justify="space-between" height={"50px"} px="4">
            <P4Bold color="text-secondary">Price</P4Bold>
            <HStack gap={3}>
              <H5>{executionPrice}</H5>
              <Flex
                onClick={switchRate}
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                color="icon-secondary"
                _hover={{ color: "text-primary", bgColor: "button-secondary" }}
                rounded="full"
                p={1}
              >
                <SwitchPrimaryIcon w="16px" h="16px" />
              </Flex>
            </HStack>
          </HStack>
        </CellStack>
      )}
    </Box>
  )
}
