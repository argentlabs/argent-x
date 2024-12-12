import { Flex, Spinner, Text } from "@chakra-ui/react"
import type { Trade } from "../../../../shared/swap/model/trade.model"
import { icons, P3 } from "@argent/x-ui"
import type { SwapInputError } from "../hooks/useSwapInfo"

const { ApproveIcon } = icons

interface SwapQuoteRefreshProps {
  trade?: Trade
  tradeLoading?: boolean
  tradeError?: SwapInputError
}

export const SwapQuoteRefresh = ({
  trade,
  tradeLoading = false,
  tradeError,
}: SwapQuoteRefreshProps) => {
  return trade && !tradeError ? (
    <Flex
      w="full"
      px={3}
      py={1.5}
      alignItems="center"
      justifyContent="space-between"
    >
      <P3 color="neutrals.300">
        Quote {tradeLoading ? "updating" : "up-to date"}
      </P3>
      <Text color="primary.500">
        {tradeLoading ? <Spinner size={"xs"} /> : <ApproveIcon />}
      </Text>
    </Flex>
  ) : null
}
