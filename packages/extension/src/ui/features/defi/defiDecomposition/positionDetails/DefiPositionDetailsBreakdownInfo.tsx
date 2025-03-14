import {
  ensureDecimals,
  prettifyCurrencyNumber,
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "@argent/x-shared"
import {
  InfoCircleSecondaryIcon,
  ArrowUpRightPrimaryIcon,
  ValidatorSecondaryIcon,
} from "@argent/x-ui/icons"
import { CellStack, H5, P4, P4Bold } from "@argent/x-ui"
import type { SquareProps } from "@chakra-ui/react"
import {
  Box,
  Divider,
  Flex,
  HStack,
  Image,
  Square,
  Tooltip,
} from "@chakra-ui/react"
import { type FC } from "react"
import {
  isCollateralizedDebtBorrowingPosition,
  isConcentratedLiquidityPosition,
  isStrkDelegatedStakingPosition,
  type ParsedPosition,
} from "../../../../../shared/defiDecomposition/schema"
import { checkHasRewards } from "../../../../../shared/staking/utils"
import type { BaseWalletAccount } from "../../../../../shared/wallet.model"
import { CollateralizedDebtStatus } from "../CollateralizedDebtStatus"
import { ConcentratedLiquidityStatus } from "../ConcentratedLiquidityStatus"
import { useDefiPositionBreakdownInfo } from "./useDefiPositionBreakdownInfo"

interface PositionDetailsBreakdownInfoProps {
  position: ParsedPosition
  account: BaseWalletAccount
  dappId?: string
}

interface ProviderIconProps extends SquareProps {
  iconUrl?: string
}

const ProviderIcon: FC<ProviderIconProps> = ({
  iconUrl,
  size = 5,
  ...rest
}) => {
  return (
    <Square
      rounded="md"
      bg="surface-elevated-hover"
      color="text-secondary"
      position="relative"
      overflow="hidden"
      size={size}
      {...rest}
    >
      <Image
        fit="cover"
        src={iconUrl}
        fallback={<ValidatorSecondaryIcon fontSize="small" />}
      />
    </Square>
  )
}

export const DefiPositionDetailsBreakdownInfo: FC<
  PositionDetailsBreakdownInfoProps
> = ({ position, account, dappId }: PositionDetailsBreakdownInfoProps) => {
  const { netApyPercentage, providerInfo, managePositionUrl, rewards } =
    useDefiPositionBreakdownInfo({ position, account, dappId })

  const Status: FC = () => {
    if (isConcentratedLiquidityPosition(position)) {
      return (
        <>
          <HStack justify="space-between" py="3.5" px="4">
            <P4Bold color="text-secondary">Status</P4Bold>
            <HStack>
              <Flex flexDirection="column" gap="1" alignItems="flex-end">
                <ConcentratedLiquidityStatus position={position} isTitle />
              </Flex>
            </HStack>
          </HStack>
          <Divider bg="stroke-default" height="1px" />
        </>
      )
    }
    if (isCollateralizedDebtBorrowingPosition(position)) {
      return (
        <>
          <HStack justify="space-between" py="3.5" px="4">
            <P4Bold color="text-secondary">Status</P4Bold>
            <HStack>
              <Flex flexDirection="column" gap="1" alignItems="flex-end">
                <CollateralizedDebtStatus position={position} isTitle />
              </Flex>
            </HStack>
          </HStack>
          <Divider bg="stroke-default" height="1px" />
        </>
      )
    }
  }

  const Rewards = () => {
    if (isStrkDelegatedStakingPosition(position)) {
      const hasRewards = checkHasRewards(rewards.balance)

      return (
        <>
          <HStack justify="space-between" py="3.5" px="4">
            <Flex alignItems="center" gap="1" color="text-secondary">
              <P4Bold>Rewards</P4Bold>
              <Tooltip
                width={"180px"}
                label="Total amount of STRK earned by staking"
              >
                <P4Bold cursor="pointer">
                  <InfoCircleSecondaryIcon />
                </P4Bold>
              </Tooltip>
            </Flex>
            <Flex flexDirection="column" alignItems="flex-end" gap="1px">
              <H5 color={hasRewards ? "text-success" : "text-primary"}>
                {prettifyTokenAmount({
                  amount: rewards.balance,
                  decimals: ensureDecimals(rewards.token?.decimals),
                  symbol: rewards.token?.symbol,
                })}
              </H5>
              <P4 color="text-secondary">
                {prettifyCurrencyValue(rewards.usdValue)}
              </P4>
            </Flex>
          </HStack>

          <Divider bg="stroke-default" height="1px" />
        </>
      )
    }
    return null
  }

  return (
    <Flex flexDirection="column" gap={2}>
      <Box
        w="full"
        borderRadius="12px"
        border="1px solid"
        borderColor="800"
        boxShadow="elevated"
        bgColor="surface-elevated"
      >
        <CellStack gap={0} p={0}>
          <Status />

          {netApyPercentage && (
            <>
              <HStack justify="space-between" py="3.5" px="4">
                <Flex alignItems="center" gap="1" color="text-secondary">
                  <P4Bold>Net APY (variable)</P4Bold>
                  <Tooltip
                    width={"180px"}
                    label={
                      isStrkDelegatedStakingPosition(position)
                        ? "Net APY after provider fee"
                        : "Net APY is what you’re predicted to earn after fees. This doesn’t include deposit and withdrawal fees (where applicable)"
                    }
                  >
                    <P4Bold cursor="pointer">
                      <InfoCircleSecondaryIcon />
                    </P4Bold>
                  </Tooltip>
                </Flex>
                <H5>{prettifyCurrencyNumber(netApyPercentage)}%</H5>
              </HStack>

              <Divider bg="stroke-default" height="1px" />
            </>
          )}

          <Rewards />

          {providerInfo && (
            <>
              <HStack justify="space-between" py="3.5" px="4">
                <P4Bold color="text-secondary">Provider</P4Bold>
                <HStack>
                  <ProviderIcon iconUrl={providerInfo.url} />
                  <H5>{providerInfo.name}</H5>
                </HStack>
              </HStack>
            </>
          )}
        </CellStack>
      </Box>

      {managePositionUrl && providerInfo && (
        <Flex
          py="3.5"
          px="4"
          w="full"
          justify="space-between"
          alignItems="center"
          borderRadius="12px"
          border="1px solid"
          borderColor="800"
          boxShadow="elevated"
          bgColor="surface-elevated"
          cursor="pointer"
          onClick={() => window.open(managePositionUrl, "_blank")}
        >
          <Flex
            alignItems="center"
            justifyContent={"space-between"}
            width="full"
          >
            <H5>Manage on {providerInfo.name}</H5>
            <ArrowUpRightPrimaryIcon width="16px" height="16px" />
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}
