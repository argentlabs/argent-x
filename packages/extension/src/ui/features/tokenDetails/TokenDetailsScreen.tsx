import type { Address } from "@argent/x-shared"
import {
  bigDecimal,
  isEqualAddress,
  prettifyCurrencyValue,
  prettifyTokenAmount,
  voidify,
} from "@argent/x-shared"
import type { CrosshairMoveProps, TimeFrameOption } from "@argent/x-ui"

import {
  PlusPrimaryIcon,
  SwapPrimaryIcon,
  SendSecondaryIcon,
  InfoCircleSecondaryIcon,
  InvestSecondaryIcon,
} from "@argent/x-ui/icons"

import {
  B3,
  BarBackButton,
  formatDate,
  formatDateTime,
  H1,
  H5,
  L1Bold,
  NavigationBar,
  P2,
  P3,
  TokenIcon,
  useToast,
} from "@argent/x-ui"
import { scrollbarStyle } from "@argent/x-ui/theme"
import {
  Box,
  Center,
  Flex,
  Tab,
  TabList,
  Tabs,
  Tooltip,
} from "@chakra-ui/react"
import type { FC } from "react"
import { useCallback, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { STRK_TOKEN_ADDRESS } from "../../../shared/network/constants"
import { routes } from "../../../shared/ui/routes"
import { ActionButton } from "../../components/ActionButton"
import { useNavigateReturnToOrBack } from "../../hooks/useNavigateReturnTo"
import { useCurrentPathnameWithQuery } from "../../hooks/useRoute"
import { clientTokenService } from "../../services/tokens"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useTokenWithBalanceAndUsdValue } from "../../views/tokenPrices"
import { ActivityListContainer } from "../accountActivity/ActivityListContainer"
import { useActivityTabWithRestoreScrollState } from "../accountActivity/useActivityTabWithRestoreScrollState"
import { useTokenPriceDetails } from "../accountTokens/tokenPriceHooks"
import { useTokenInfo } from "../accountTokens/tokens.state"
import { TOKENS_WITH_ON_RAMP } from "../funding/constants"
import { useIsDefaultNetwork } from "../networks/hooks/useIsDefaultNetwork"
import { useIsMainnet } from "../networks/hooks/useIsMainnet"
import { OptionMenu } from "./OptionsMenu"
import { TokenDetailsChartContainer } from "./TokenDetailsChartContainer"
import { useTokenActivities } from "./hooks/useTokenActivities"
import { useKeyValueStorage } from "../../hooks/useStorage"
import { stakingStore } from "../../../shared/staking/storage"
import { ampli } from "../../../shared/analytics"

const activityTabIndex = 0
const aboutTabIndex = 1

export const TokenDetailsScreen: FC = () => {
  const isMainnet = useIsMainnet()
  const isDefaultNetwork = useIsDefaultNetwork()
  const toast = useToast()

  const [tabIndex, setTabIndex] = useActivityTabWithRestoreScrollState(
    activityTabIndex,
    activityTabIndex,
  )

  const [timeFrameOption, setTimeFrameOption] =
    useState<TimeFrameOption>("oneDay")

  const [crosshair, setCrosshair] = useState<CrosshairMoveProps | undefined>(
    undefined,
  )
  const onCrosshairMove = useCallback((props: CrosshairMoveProps) => {
    if (!props) {
      setCrosshair(undefined)
    } else {
      setCrosshair(props)
    }
  }, [])

  const priceAtTime = crosshair?.price

  const { address, networkId } = useParams<{
    address: Address
    networkId: string
  }>()
  const account = useView(selectedAccountView)
  const token = useTokenWithBalanceAndUsdValue(networkId, address, account)
  const priceDetails = useTokenPriceDetails(token)
  const returnTo = useCurrentPathnameWithQuery()
  const navigate = useNavigate()
  const onBack = useNavigateReturnToOrBack()
  const { data: activities } = useTokenActivities(address)

  const isStakingEnabled = useKeyValueStorage(stakingStore, "enabled")

  let displayBalance: string | null = ""
  if (token?.balance) {
    displayBalance = prettifyTokenAmount({
      amount: token.balance,
      decimals: token.decimals,
      symbol: token.symbol,
    })
  }

  const tokenInfo = useTokenInfo({ address, networkId })

  const balanceAtTime = useMemo(() => {
    if (priceAtTime && token?.balance) {
      const prettifiedBalance = prettifyTokenAmount({
        amount: token.balance,
        decimals: token.decimals,
      })
      if (!prettifiedBalance) {
        return null
      }

      const bigDecimalBalance = bigDecimal.toBigDecimal(
        token.balance,
        token.decimals,
      )
      const bigDecimalPrice = bigDecimal.parseUnits(priceAtTime.toString())

      const balanceValueAtTime = bigDecimal.mul(
        bigDecimalBalance,
        bigDecimalPrice,
      )

      return prettifyCurrencyValue(balanceValueAtTime.toString(), undefined, {
        allowLeadingZerosInDecimalPart: false,
      })
    }
    return null
  }, [priceAtTime, token?.balance, token?.decimals])

  const displayCurrencyValue = prettifyCurrencyValue(
    token?.usdValue,
    undefined,
    {
      allowLeadingZerosInDecimalPart: false,
    },
  )

  const tokenPrice = prettifyCurrencyValue(priceDetails?.ccyValue, undefined, {
    allowLeadingZerosInDecimalPart: false,
  })

  const onClickSend = useCallback(() => {
    if (token) {
      navigate(
        routes.sendRecipientScreen({
          returnTo,
          tokenAddress: token.address,
        }),
      )
    }
  }, [navigate, returnTo, token])

  const onClickSwap = useCallback(() => {
    if (token) {
      void ampli.swapTabClicked({
        "wallet platform": "browser extension",
        "swap entered from": "token details page",
      })
      navigate(routes.swapToken(token.address, returnTo))
    }
  }, [navigate, returnTo, token])

  const onClickStake = useCallback(() => {
    if (token) {
      navigate(routes.staking(returnTo))
    }
  }, [navigate, returnTo, token])

  const { isSendEnabled, isSwapEnabled, isBuyEnabled, isStakeEnabled } =
    useMemo(() => {
      const hasOnRamp =
        isMainnet &&
        TOKENS_WITH_ON_RAMP.some((address) =>
          isEqualAddress(address, token?.address),
        )
      const isTradable = Boolean(token?.tradable)
      const isStrk = isEqualAddress(token?.address, STRK_TOKEN_ADDRESS)

      return {
        isSendEnabled: true,
        isSwapEnabled: isTradable && isDefaultNetwork,
        isBuyEnabled: hasOnRamp,
        isStakeEnabled: isStrk && isStakingEnabled && isDefaultNetwork,
      }
    }, [
      isDefaultNetwork,
      isMainnet,
      isStakingEnabled,
      token?.address,
      token?.tradable,
    ])

  const onClickBuy = useCallback(() => {
    if (token) {
      navigate(routes.fundingProvider(token.address, returnTo))
    }
  }, [token, navigate, returnTo])

  const onHideToken = async () => {
    if (!token || token?.hidden) {
      return
    }
    await clientTokenService.toggleHideToken(token, true)
    navigate(routes.accountTokens())
  }

  const onHideAndReportSpamToken = async () => {
    if (!token || !account) {
      return
    }
    await clientTokenService.reportSpamToken(token, account)
    await clientTokenService.toggleHideToken(token, true)
    toast({
      title: `${token.name} has been reported`,
      status: "success",
      duration: 3000,
    })
    navigate(routes.accountTokens())
  }

  const subtitle = useMemo(() => {
    if (!crosshair) {
      return "Your balance"
    }
    const time = Number(crosshair.time) * 1000
    if (timeFrameOption === "allTime" || timeFrameOption === "oneYear") {
      return formatDate(time)
    }
    return formatDateTime(time)
  }, [crosshair, timeFrameOption])

  const header = useMemo(() => {
    if (!token) {
      return null
    }

    const tokenName = token.name === "Ether" ? "Ethereum" : token.name
    return (
      <Flex px={4} flexDirection="column">
        <Center gap={2}>
          <TokenIcon size={6} url={token.iconUrl} name={tokenName} />
          <Flex align="baseline" gap={2}>
            <H5 color="text-primary">{tokenName}</H5>
            {tokenPrice && (
              <P3 color="text-secondary" fontWeight={"bold"}>
                {tokenPrice ?? 0}
              </P3>
            )}
          </Flex>
        </Center>
        <Center flexDir="column" mt={6} gap={1}>
          <H5
            color="text-secondary"
            sx={
              crosshair
                ? {
                    fontVariantNumeric: "tabular-nums",
                  }
                : undefined
            }
          >
            {subtitle}
          </H5>
          <H1
            sx={{
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {balanceAtTime ?? displayCurrencyValue}
          </H1>
          <P3 color="text-secondary" fontWeight={"bold"}>
            {displayBalance}
          </P3>
        </Center>
        <Center gap={6} mt={10} mb={3}>
          {isBuyEnabled && (
            <ActionButton
              icon={<PlusPrimaryIcon />}
              label="Buy"
              onClick={onClickBuy}
            />
          )}
          {isSwapEnabled && (
            <ActionButton
              icon={<SwapPrimaryIcon />}
              label="Swap"
              onClick={onClickSwap}
            />
          )}
          {isStakeEnabled && (
            <ActionButton
              icon={<InvestSecondaryIcon />}
              label="Stake"
              onClick={onClickStake}
            />
          )}
          {isSendEnabled && (
            <ActionButton
              icon={<SendSecondaryIcon />}
              label="Send"
              onClick={onClickSend}
            />
          )}
        </Center>
        <TokenDetailsChartContainer
          mt={4}
          timeFrameOption={timeFrameOption}
          setTimeFrameOption={setTimeFrameOption}
          tokenAddress={address}
          crosshair={crosshair}
          onCrosshairMove={onCrosshairMove}
        />
      </Flex>
    )
  }, [
    address,
    balanceAtTime,
    crosshair,
    displayBalance,
    displayCurrencyValue,
    isBuyEnabled,
    isSendEnabled,
    isStakeEnabled,
    isSwapEnabled,
    onClickBuy,
    onClickSend,
    onClickStake,
    onClickSwap,
    onCrosshairMove,
    subtitle,
    timeFrameOption,
    token,
    tokenPrice,
  ])

  const [scrollContainerReady, setScrollContainerReady] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const setScrollContainerRef = useCallback((ref: HTMLDivElement) => {
    scrollContainerRef.current = ref
    setScrollContainerReady(Boolean(ref))
  }, [])

  const content = useMemo(() => {
    if (
      tabIndex === activityTabIndex &&
      account &&
      scrollContainerReady &&
      scrollContainerRef.current
    ) {
      return (
        <ActivityListContainer
          style={{ height: 1000 }}
          activities={activities}
          account={account}
          customScrollParent={scrollContainerRef.current}
        />
      )
    }
    if (tabIndex === aboutTabIndex)
      return (
        <Flex px={4} flexDirection="column" minHeight="100vh">
          <Flex
            justifyContent={"space-between"}
            gap="1"
            padding={4}
            borderTopRadius={"lg"}
            bg="surface-elevated"
            mb={0.5}
            alignItems={"center"}
          >
            <Flex alignItems="center">
              <P2 color="text-secondary" fontWeight="semibold">
                Market cap
              </P2>
              <Tooltip
                title="Market cap"
                label={
                  <>
                    <L1Bold mb={1}>Market cap</L1Bold>
                    <P3 fontSize={"xs"} color="text-secondary">
                      Current price multiplied by the current amount of tokens
                      in circulation.
                    </P3>
                  </>
                }
                width={54}
                padding={3}
              >
                <Box
                  marginLeft={1}
                  _hover={{
                    cursor: "pointer",
                  }}
                >
                  <InfoCircleSecondaryIcon color="text-secondary" />
                </Box>
              </Tooltip>
            </Flex>
            <Flex
              flexDir={"column"}
              justifyContent={"flex-end"}
              textAlign="right"
              gap={1}
            >
              <H5>
                $
                {Intl.NumberFormat("en", { notation: "compact" }).format(
                  tokenInfo?.marketData?.marketCap ?? 0,
                )}
              </H5>
              {tokenInfo?.marketData &&
                tokenInfo.marketData.marketCap24hChange > 0 && (
                  <B3
                    color={
                      tokenInfo.marketData?.marketCap24hChange > 0
                        ? "text-success"
                        : "text-danger"
                    }
                  >
                    {tokenInfo.marketData?.marketCap24hChange
                      ? `${tokenInfo.marketData.marketCap24hChange.toFixed(2)}%`
                      : ""}
                  </B3>
                )}
            </Flex>
          </Flex>
          <Flex
            justifyContent={"space-between"}
            gap="1"
            padding={4}
            borderBottomRadius={"lg"}
            bg="surface-elevated"
            mb={4}
          >
            <Flex alignItems="center">
              <P2 color="text-secondary" fontWeight="semibold">
                24hr volume
              </P2>
              <Tooltip
                title="24hr volume"
                label={
                  <>
                    <L1Bold mb={1}>24 volume</L1Bold>
                    <P3 fontSize={"xs"} color="text-secondary">
                      Measure of how much this token was traded in the last 24
                      hours (represented in USD).
                    </P3>
                  </>
                }
                width={54}
                padding={3}
              >
                <Box
                  marginLeft={1}
                  _hover={{
                    cursor: "pointer",
                  }}
                >
                  <InfoCircleSecondaryIcon color="text-secondary" />
                </Box>
              </Tooltip>
            </Flex>
            <H5>
              $
              {Intl.NumberFormat("en", { notation: "compact" }).format(
                tokenInfo?.marketData?.dailyVolume ?? 0,
              )}
            </H5>
          </Flex>
        </Flex>
      )

    return null
  }, [
    account,
    activities,
    scrollContainerReady,
    tabIndex,
    tokenInfo?.marketData,
  ])

  return (
    <>
      <NavigationBar
        leftButton={<BarBackButton onClick={onBack} />}
        rightButton={
          <OptionMenu
            address={address}
            canHideToken={!token?.showAlways}
            onHideToken={voidify(onHideToken)}
            onHideAndReportSpamToken={voidify(onHideAndReportSpamToken)}
          />
        }
      />
      <Box
        ref={setScrollContainerRef}
        overflowY="auto" /** FireFox */
        overflow="overlay"
        sx={scrollbarStyle}
      >
        {header}
        <Tabs mt={4} mb={4} index={tabIndex} onChange={setTabIndex}>
          <TabList>
            <Tab>Activity</Tab>
            <Tab>About</Tab>
          </TabList>
        </Tabs>
        {content}
      </Box>
    </>
  )
}
