import { Flex, Spinner, Text } from "@chakra-ui/react"
import { Trade } from "../../../../shared/swap/model/trade.model"
import { P4, icons } from "@argent/x-ui"
import { SwapInputError } from "../hooks/useSwapInfo"

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
      <P4 color="neutrals.300">
        Quote {tradeLoading ? "updating" : "up-to date"}
      </P4>
      <Text color="primary.500">
        {tradeLoading ? <Spinner size={"xs"} /> : <ApproveIcon />}
      </Text>
    </Flex>
  ) : null
}
