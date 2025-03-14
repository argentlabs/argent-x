import { ensureArray } from "@argent/x-shared"
import { BarBackButton, CellStack, NavigationBar } from "@argent/x-ui"
import { scrollbarStyle } from "@argent/x-ui/theme"
import { Box, Flex, Tab, TabList, Tabs } from "@chakra-ui/react"

import {
  useCallback,
  useMemo,
  useRef,
  type FC,
  useState,
  Suspense,
} from "react"
import {
  isCollateralizedDebtBorrowingPosition,
  isCollateralizedDebtLendingPosition,
  isConcentratedLiquidityPosition,
  isDelegatedTokensPosition,
  isStakingPosition,
  isStrkDelegatedStakingPosition,
  type ParsedPositionWithUsdValue,
} from "../../../../../shared/defiDecomposition/schema"
import type { WalletAccount } from "../../../../../shared/wallet.model"
import { useActivityTabWithRestoreScrollState } from "../../../accountActivity/useActivityTabWithRestoreScrollState"
import DefiPositionDetailsBalance from "./DefiPositionDetailsBalance"
import { DefiPositionDetailsBreakdownInfo } from "./DefiPositionDetailsBreakdownInfo"
import { DefiPositionDetailsTitle } from "./DefiPositionDetailsTitle"
import { DefiPositionDetailsTokensInfo } from "./DefiPositionDetailsTokensInfo"
import { DefiPositionDetailsActions } from "./DefiPositionDetailsActions"
import { DefiPositionAlertBanner } from "./DefiPositionAlertBanner"
import { useTokenActivities } from "../../../tokenDetails/hooks/useTokenActivities"
import { ActivityListContainer } from "../../../accountActivity/ActivityListContainer"
import { useView } from "../../../../views/implementation/react"
import { investmentPositionViewFindByIdAtom } from "../../../../views/investments"

interface PositionDetailsScreenProps {
  onBack: () => void
  position: ParsedPositionWithUsdValue
  account: WalletAccount
  dappId?: string
}

const breakdownTabIndex = 0
const activityTabIndex = 1

export const DefiPositionDetailsScreen: FC<PositionDetailsScreenProps> = ({
  onBack,
  position,
  account,
  dappId,
}) => {
  const [scrollContainerReady, setScrollContainerReady] = useState(false)

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const setScrollContainerRef = useCallback((ref: HTMLDivElement) => {
    scrollContainerRef.current = ref
    setScrollContainerReady(Boolean(ref))
  }, [])

  const [tabIndex, setTabIndex] = useActivityTabWithRestoreScrollState(
    breakdownTabIndex,
    activityTabIndex,
  )

  const content = useMemo(() => {
    if (tabIndex === breakdownTabIndex) {
      return (
        <PositionBreakdown
          position={position}
          account={account}
          dappId={dappId}
        />
      )
    }

    if (
      tabIndex === activityTabIndex &&
      account &&
      scrollContainerReady &&
      scrollContainerRef.current
    ) {
      return (
        <Suspense fallback={null}>
          <PositionActivities
            account={account}
            position={position}
            scrollContainerRef={scrollContainerRef.current}
          />
        </Suspense>
      )
    }
    return null
  }, [account, position, scrollContainerReady, tabIndex, dappId])

  const totalUsdValue = useMemo(() => {
    let amount = "0"
    if (
      isStakingPosition(position) ||
      isDelegatedTokensPosition(position) ||
      isStrkDelegatedStakingPosition(position) ||
      isCollateralizedDebtLendingPosition(position)
    ) {
      amount = position.token.usdValue
    } else if (
      isConcentratedLiquidityPosition(position) ||
      isCollateralizedDebtBorrowingPosition(position)
    ) {
      amount = position.totalUsdValue
    }
    return amount
  }, [position])

  const isStrkStaking = isStrkDelegatedStakingPosition(position)

  return (
    <>
      <NavigationBar leftButton={<BarBackButton onClick={onBack} />} />

      <Box
        ref={setScrollContainerRef}
        overflowY="auto" /** FireFox */
        overflow="overlay"
        sx={scrollbarStyle}
      >
        <Flex direction="column" align="center" px="4">
          <DefiPositionDetailsTitle
            position={position}
            networkId={account.networkId}
          />
          <DefiPositionDetailsBalance totalUsdValue={totalUsdValue} />
          <DefiPositionDetailsActions position={position} account={account} />
          <DefiPositionAlertBanner position={position} account={account} />
        </Flex>

        <Tabs mb={4} index={tabIndex} onChange={setTabIndex}>
          <TabList>
            <Tab>Breakdown</Tab>
            {!isStrkStaking && <Tab>Activity</Tab>}
          </TabList>
        </Tabs>

        {content}
      </Box>
    </>
  )
}

const PositionBreakdown: FC<{
  position: ParsedPositionWithUsdValue
  account: WalletAccount
  dappId?: string
}> = ({ position, account, dappId }) => {
  return (
    <Suspense fallback={null}>
      <CellStack gap="4" pt={0}>
        <DefiPositionDetailsBreakdownInfo
          position={position}
          account={account}
          dappId={dappId}
        />
        <DefiPositionDetailsTokensInfo position={position} account={account} />
      </CellStack>
    </Suspense>
  )
}

const PositionActivities: FC<{
  account: WalletAccount
  scrollContainerRef: HTMLElement | undefined
  position: ParsedPositionWithUsdValue
}> = ({ position, account, scrollContainerRef }) => {
  const investmentPosition = useView(
    investmentPositionViewFindByIdAtom({ positionId: position.id }),
  )
  const liquidTokens = ensureArray(investmentPosition?.liquidityTokens)

  // This will have to be changed when we will support activities for positions with multiple tokens
  const liquidTokenAddress =
    liquidTokens.length === 1 ? liquidTokens[0].address : undefined
  const { data: activities } = useTokenActivities(liquidTokenAddress)

  return (
    <ActivityListContainer
      style={{ height: 1000 }}
      activities={ensureArray(activities)}
      account={account}
      customScrollParent={scrollContainerRef}
    />
  )
}
