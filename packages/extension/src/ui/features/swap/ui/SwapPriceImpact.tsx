import { usePriceImpactConfig } from "@argent/x-ui"

import { L1Bold } from "@argent/x-ui"

import type { PriceImpactResult } from "../../../../shared/swap/model/trade.model"
import { WarningCircleSecondaryIcon } from "@argent/x-ui/icons"

interface SwapPriceImpactProps {
  priceImpact?: PriceImpactResult
}
export const SwapPriceImpact: React.FC<SwapPriceImpactProps> = ({
  priceImpact,
}: SwapPriceImpactProps) => {
  const config = usePriceImpactConfig()

  if (!priceImpact || priceImpact.type === "low") {
    return null
  }

  const currentConfig = config[priceImpact.type]

  return (
    <L1Bold
      color={currentConfig.textColor}
      bg={currentConfig.bgColor}
      px="2"
      py="1"
      borderRadius="lg"
      display="flex"
      alignItems="center"
      gap="1"
    >
      <WarningCircleSecondaryIcon width="16px" height="16px" />
      {currentConfig.text}
    </L1Bold>
  )
}
