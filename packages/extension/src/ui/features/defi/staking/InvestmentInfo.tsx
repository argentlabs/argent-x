import type { StrkDelegatedStakingInvestment } from "@argent/x-shared"
import { prettifyCurrencyValue } from "@argent/x-shared"
import { bigDecimal, prettifyCurrencyNumber } from "@argent/x-shared"
import { CellStack, icons, P3Bold } from "@argent/x-ui"
import type { BoxProps } from "@chakra-ui/react"
import { Box, Flex, HStack, Image, Square, Tooltip } from "@chakra-ui/react"
import type { FC } from "react"

const { InfoCircleSecondaryIcon, NoImageSecondaryIcon } = icons

interface InvestmentInfoProps extends BoxProps {
  investment?: StrkDelegatedStakingInvestment
}

export const InvestmentInfo: FC<InvestmentInfoProps> = ({
  investment,
  ...rest
}) => {
  if (!investment) {
    return null
  }

  const apyPercentage = bigDecimal.formatUnits(
    bigDecimal.mul(
      bigDecimal.parseUnits(investment.metrics.totalApy),
      bigDecimal.toBigDecimal(100, 0),
    ),
  )

  const feePercentage = bigDecimal.formatUnits(
    bigDecimal.mul(
      bigDecimal.parseUnits(investment.fees.performanceFees?.totalFee ?? "0"),
      bigDecimal.toBigDecimal(100, 0),
    ),
  )

  const totalStake =
    prettifyCurrencyValue(investment.metrics.tvl ?? "0", undefined, {
      minDecimalPlaces: 0,
    }) ?? "unknown"

  return (
    <Box
      py="2"
      px="3"
      w="full"
      borderRadius="12px"
      border="1px solid"
      borderColor="800"
      boxShadow="menu"
      {...rest}
    >
      <CellStack gap={0} p={0}>
        <HStack justify="space-between" py="1">
          <P3Bold color="text-secondary">Provider</P3Bold>
          <HStack>
            <Square
              size="5"
              rounded="md"
              bg="surface-elevated-hover"
              color="text-secondary"
              position="relative"
              overflow="hidden"
            >
              <Image
                fit="cover"
                src={investment.stakerInfo.iconUrl}
                fallback={<NoImageSecondaryIcon fontSize="xl" />}
              />
            </Square>
            <P3Bold>{investment.stakerInfo.name}</P3Bold>
          </HStack>
        </HStack>
        <HStack justify="space-between" py="1.5">
          <Flex alignItems="center" gap="1" color="text-secondary">
            <P3Bold>Estimated APY</P3Bold>
            <Tooltip
              label={`Estimated APY after ${feePercentage}% provider fee`}
            >
              <P3Bold cursor="pointer">
                <InfoCircleSecondaryIcon />
              </P3Bold>
            </Tooltip>
          </Flex>
          <P3Bold>{prettifyCurrencyNumber(apyPercentage)}%</P3Bold>
        </HStack>
        <HStack justify="space-between" py="1.5">
          <Flex alignItems="center" gap="1" color="text-secondary">
            <P3Bold>Total invested (TVL)</P3Bold>
            <Tooltip label="TVL of STRK of the provider">
              <P3Bold cursor="pointer">
                <InfoCircleSecondaryIcon />
              </P3Bold>
            </Tooltip>
          </Flex>
          <P3Bold>{totalStake}</P3Bold>
        </HStack>
      </CellStack>
    </Box>
  )
}
