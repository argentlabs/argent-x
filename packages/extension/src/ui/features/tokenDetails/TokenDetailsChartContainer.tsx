import type { ComponentProps, FC } from "react"
import { useMemo } from "react"
import type { CrosshairMoveProps, TokenDetailsChartProps } from "@argent/x-ui"
import {
  DetailsSidePanelChartRangeButtons,
  TokenDetailsChart,
  TokenDetailsChartTooltip,
} from "@argent/x-ui"
import { theme } from "@argent/x-ui/theme"

import { getChartOptions, getSeriesConfig } from "./config"
import { isEmpty } from "lodash-es"
import { useTokenGraphInfo } from "./hooks/useTokenGraphInfo"
import type { Address } from "@argent/x-shared"
import type { FlexProps } from "@chakra-ui/react"
import { Box, Flex } from "@chakra-ui/react"

const STROKE_BRAND = theme.colors["primary.orange.600"]
const chartOptions = getChartOptions(STROKE_BRAND)

interface TokenDetailsChartContainerProps
  extends FlexProps,
    Pick<
      ComponentProps<typeof DetailsSidePanelChartRangeButtons>,
      "timeFrameOption" | "setTimeFrameOption"
    >,
    Pick<TokenDetailsChartProps, "onCrosshairMove"> {
  tokenAddress?: Address
  crosshair?: CrosshairMoveProps
}

export const TokenDetailsChartContainer: FC<
  TokenDetailsChartContainerProps
> = ({
  tokenAddress,
  timeFrameOption,
  setTimeFrameOption,
  onCrosshairMove,
  crosshair,
  ...rest
}) => {
  const { data: tokenGraphInfo, isValidating } = useTokenGraphInfo(
    tokenAddress,
    timeFrameOption,
  )
  const tokenGraphData = useMemo(() => {
    if (!tokenGraphInfo?.prices) {
      return
    }
    return {
      prices: tokenGraphInfo.prices,
    }
  }, [tokenGraphInfo])

  const unavailablePrices = !isValidating && isEmpty(tokenGraphInfo?.prices)
  return (
    <Flex direction={"column"} gap={4} {...rest}>
      <Box w="full" minHeight={`${chartOptions.height}px`}>
        {tokenGraphData && (
          <TokenDetailsChart
            tokenGraphData={tokenGraphData}
            chartOptions={chartOptions}
            getSeriesConfig={getSeriesConfig}
            markerColor={STROKE_BRAND}
            onCrosshairMove={onCrosshairMove}
          >
            <TokenDetailsChartTooltip crosshair={crosshair} />
          </TokenDetailsChart>
        )}
      </Box>
      <DetailsSidePanelChartRangeButtons
        timeFrameOption={timeFrameOption}
        setTimeFrameOption={setTimeFrameOption}
        isUnavailable={unavailablePrices}
      />
    </Flex>
  )
}
