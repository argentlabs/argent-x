import { prettifyCurrencyValue } from "@argent/x-shared"
import { H1, H5 } from "@argent/x-ui"
import { VStack } from "@chakra-ui/react"
import React from "react"

interface PositionBalanceProps {
  totalUsdValue: string
}

const DefiPositionDetailsBalance: React.FC<PositionBalanceProps> = ({
  totalUsdValue,
}) => (
  <VStack spacing="1" mt="6">
    <H5 color="text-secondary">Position balance</H5>
    <H1>{prettifyCurrencyValue(totalUsdValue)}</H1>
  </VStack>
)

export default DefiPositionDetailsBalance
