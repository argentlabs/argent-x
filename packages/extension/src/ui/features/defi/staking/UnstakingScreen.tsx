import type { FC } from "react"
import {
  BarBackButton,
  CellStack,
  H5,
  HeaderCell,
  L2Bold,
  NavigationContainer,
  P4Bold,
  TokenIcon,
  icons,
} from "@argent/x-ui"
import {
  Box,
  Flex,
  HStack,
  Square,
  Image,
  Tooltip,
  Divider,
  Button,
} from "@chakra-ui/react"
import type { StakerInfo } from "@argent/x-shared"
import { prettifyCurrencyValue, prettifyTokenAmount } from "@argent/x-shared"
import type { Token } from "../../../../shared/token/__new/types/token.model"
import type { StrkDelegatedBalance } from "../../../views/staking"
import { checkHasRewards } from "../../../../shared/staking/utils"
import { StakingWarningBox } from "./StakingWarningBox"

const { InfoCircleSecondaryIcon, NoImageSecondaryIcon } = icons

interface UnstakingScreenProps {
  tokenInfo: Token
  stakerInfo: StakerInfo
  balance: StrkDelegatedBalance
  usdValue: StrkDelegatedBalance
  onBack: () => void
  onWithdraw: () => void
  withdrawLoading?: boolean
}

export const UnstakingScreen: FC<UnstakingScreenProps> = ({
  onBack,
  tokenInfo,
  balance,
  stakerInfo, // provider and staker are used interchangeably
  usdValue,
  withdrawLoading = false,
  onWithdraw,
}) => {
  const hasRewards = checkHasRewards(balance.rewards)

  return (
    <NavigationContainer
      title="Initiate withdraw"
      leftButton={<BarBackButton onClick={onBack} />}
    >
      <CellStack flex={1}>
        <HeaderCell>Total withdraw</HeaderCell>
        <Flex
          px="4"
          py="3"
          justifyContent="space-between"
          align="center"
          borderRadius="xl"
          bgColor="surface-elevated"
        >
          <HStack gap="3">
            <TokenIcon
              size={10}
              url={tokenInfo.iconUrl}
              name={tokenInfo.name}
            />
            <H5>{tokenInfo.name}</H5>
          </HStack>

          <Flex flexDirection="column" align="flex-end">
            <H5>
              {prettifyTokenAmount({
                ...tokenInfo,
                amount: balance.total,
              })}
            </H5>
            <L2Bold color="text-secondary">
              {prettifyCurrencyValue(usdValue.total)}
            </L2Bold>
          </Flex>
        </Flex>

        <HeaderCell>Breakdown</HeaderCell>
        <Box
          w="full"
          borderRadius="12px"
          border="1px solid"
          borderColor="800"
          boxShadow="elevated"
          bgColor="surface-elevated"
        >
          <CellStack gap={0} p={0}>
            <HStack justify="space-between" py="3.5" px="4">
              <P4Bold color="text-secondary">Provider</P4Bold>
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
                    src={stakerInfo.iconUrl}
                    fallback={<NoImageSecondaryIcon fontSize="xl" />}
                  />
                </Square>
                <H5>{stakerInfo.name}</H5>
              </HStack>
            </HStack>

            <Divider bg="stroke-default" height="1px" />

            <HStack justify="space-between" py="3.5" px="4">
              <Flex alignItems="center" gap="1" color="text-secondary">
                <P4Bold>Staked Balance</P4Bold>
                <Tooltip label="Total amount of STRK you staked with this provider">
                  <P4Bold cursor="pointer">
                    <InfoCircleSecondaryIcon />
                  </P4Bold>
                </Tooltip>
              </Flex>
              <H5>
                {prettifyTokenAmount({
                  ...tokenInfo,
                  amount: balance.stakedAmount,
                })}
              </H5>
            </HStack>

            <Divider bg="stroke-default" height="1px" />

            <HStack justify="space-between" py="3.5" px="4">
              <Flex alignItems="center" gap="1" color="text-secondary">
                <P4Bold>Rewards</P4Bold>
                <Tooltip label="Total amount of STRK earned by staking">
                  <P4Bold cursor="pointer">
                    <InfoCircleSecondaryIcon />
                  </P4Bold>
                </Tooltip>
              </Flex>
              <H5 color={hasRewards ? "text-success" : "text-primary"}>
                {prettifyTokenAmount({
                  ...tokenInfo,
                  amount: balance.rewards,
                })}
              </H5>
            </HStack>
          </CellStack>
        </Box>

        <StakingWarningBox />

        <Flex flex={1} />

        <Button
          colorScheme="primary"
          isLoading={withdrawLoading}
          onClick={onWithdraw}
        >
          Withdraw
        </Button>
      </CellStack>
    </NavigationContainer>
  )
}
