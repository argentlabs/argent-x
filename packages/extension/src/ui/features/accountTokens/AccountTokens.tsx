import {
  Box,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from "@chakra-ui/react"
import type { FC } from "react"
import { Suspense } from "react"

import { ampli } from "../../../shared/analytics"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useTabIndexWithHash } from "../../hooks/useTabIndexWithHash"
import { WalletNftsTabContainer } from "../accountNfts/WalletNftsTabContainer"
import { WalletDefiTabContainer } from "../defi/WalletDefiTabContainer"
import { AccountBannersContainer } from "../banners/AccountBannersContainer"
import { AccountTokensBalanceSkeleton } from "./AccountTokensBalance"
import { AccountTokensBalanceContainer } from "./AccountTokensBalanceContainer"
import { AccountTokensButtonsSkeleton } from "./AccountTokensButtons"
import { AccountTokensButtonsContainer } from "./AccountTokensButtonsContainer"
import { AddFundsDialogProvider } from "./useAddFundsDialog"
import { WalletCoinsTabContainer } from "./WalletCoinsTabContainer"
import {
  SaveRecoverySeedphraseBanner,
  useShowSaveRecoverySeedphraseBanner,
} from "../banners/SaveRecoverySeedphraseBanner"
import { useBanners } from "../banners/useBanners"
import { usePromptUserReview } from "./usePromptUserReview"
import { isDefiDecompositionEnabled } from "../../../shared/defiDecomposition"
import { useKeyValueStorage } from "../../hooks/useStorage"
import { stakingStore } from "../../../shared/staking/storage"
import { useIsDefaultNetwork } from "../networks/hooks/useIsDefaultNetwork"

export interface AccountTokensProps {
  account: WalletAccount
}

export const AccountTokensSkeleton: FC = () => {
  return (
    <Flex direction={"column"} flex={1}>
      <VStack spacing={6} my={14}>
        <AccountTokensBalanceSkeleton />
        <AccountTokensButtonsSkeleton />
      </VStack>
    </Flex>
  )
}

export const AccountTokens: FC<AccountTokensProps> = ({ account }) => {
  usePromptUserReview()
  const [tabIndex, setTabIndex] = useTabIndexWithHash(["coins", "nfts", "defi"])
  const isDefaultNetwork = useIsDefaultNetwork()

  const isStakingEnabled = useKeyValueStorage(stakingStore, "enabled")

  const showDefiTab =
    (isStakingEnabled || isDefiDecompositionEnabled) && isDefaultNetwork
  const showSaveRecoverySeedphraseBanner = useShowSaveRecoverySeedphraseBanner()
  const banners = useBanners(account)
  const hasBanners = banners.length > 0 || showSaveRecoverySeedphraseBanner

  return (
    <Flex direction={"column"} data-testid="account-tokens" flex={1}>
      <VStack spacing={6} mt={hasBanners ? 8 : 14} mb={hasBanners ? 6 : 14}>
        <Suspense fallback={<AccountTokensBalanceSkeleton />}>
          <AccountTokensBalanceContainer account={account} />
        </Suspense>
        {showSaveRecoverySeedphraseBanner ? (
          <SaveRecoverySeedphraseBanner mx={4} />
        ) : (
          <Suspense fallback={<AccountTokensButtonsSkeleton />}>
            <AddFundsDialogProvider account={account}>
              <AccountTokensButtonsContainer account={account} />
            </AddFundsDialogProvider>
          </Suspense>
        )}
      </VStack>
      {banners.length > 0 && (
        <Box px={4} mb={9}>
          <Suspense>
            <AccountBannersContainer account={account} />
          </Suspense>
        </Box>
      )}
      <Tabs isLazy index={tabIndex} onChange={setTabIndex}>
        <TabList>
          <Tab aria-label="Coins">Coins</Tab>
          <Tab aria-label="NFTs">NFTs</Tab>
          {showDefiTab && <Tab aria-label="DeFi">DeFi</Tab>}
        </TabList>
        <TabPanels mt={4}>
          <TabPanel>
            <WalletCoinsTabContainer account={account} />
          </TabPanel>
          <TabPanel>
            <WalletNftsTabContainer account={account} />
          </TabPanel>
          {showDefiTab && (
            <TabPanel>
              <WalletDefiTabContainer />
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </Flex>
  )
}
