import {
  L1,
  NavigationBarSkeleton,
  ScrollContainer,
  TabBarTab,
  TabBar,
  icons,
  useScrollRestoration,
} from "@argent/x-ui"
import { Center, Flex } from "@chakra-ui/react"
import { ComponentProps, FC, PropsWithChildren, Suspense, useMemo } from "react"
import { NavLink } from "react-router-dom"

import { routes } from "../../routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useIsSignerInMultisig } from "../multisig/hooks/useIsSignerInMultisig"
import { useMultisig } from "../multisig/multisig.state"
import { useMultisigPendingTransactionsAwaitingConfirmation } from "../multisig/multisigTransactions.state"
import { WithEscapeWarning } from "../shield/escape/WithEscapeWarning"
import { AccountNavigationBarContainer } from "./AccountNavigationBarContainer"
import { useAccountTransactions } from "./accountTransactions.state"
import { LegalAgreementsBannerContainer } from "../legal/LegalAgreementsBannerContainer"
import { discoverDataView, discoverViewedAtView } from "../../views/discover"

const { WalletIcon, NftIcon, ActivityIcon, SwapIcon, FlameIcon } = icons

/** TODO: refactor: rename 'RootTabsContainer' or similar and extract 'RootTabs' component */

interface AccountContainerProps extends PropsWithChildren {
  scrollKey: string
}

export const AccountContainer: FC<AccountContainerProps> = (props) => {
  const account = useView(selectedAccountView)
  // TODO: refactor multisig to use services and views
  const multisig = useMultisig(account)
  const signerIsInMultisig = useIsSignerInMultisig(multisig)

  // TODO: refactor activity/transactions to use services and views
  const { pendingTransactions } = useAccountTransactions(account)
  const pendingMultisigTransactions =
    useMultisigPendingTransactionsAwaitingConfirmation(account)

  const showActivateBanner = Boolean(multisig?.needsDeploy) // False if multisig is undefined

  const showSignerIsRemovedBanner = !signerIsInMultisig
  const showMultisigBanner =
    multisig && (showActivateBanner || showSignerIsRemovedBanner)

  const showTabs = Boolean(account)

  const totalPendingTransactions =
    pendingTransactions.length + pendingMultisigTransactions.length

  const discoverViewedAt = useView(discoverViewedAtView)
  const discoverData = useView(discoverDataView)

  const discoverBadgeLabel = useMemo(() => {
    if (!discoverData) {
      return 0
    }
    const lastModifiedAt = new Date(discoverData.lastModified).getTime()
    if (discoverViewedAt > lastModifiedAt) {
      return 0
    }
    return discoverData.news.length
  }, [discoverData, discoverViewedAt])

  return (
    <RootTabs
      showTabs={showTabs}
      activityBadgeLabel={totalPendingTransactions}
      discoverBadgeLabel={discoverBadgeLabel}
      showMultisigBanner={showMultisigBanner}
      showActivateBanner={showActivateBanner}
      {...props}
    />
  )
}

export interface RootTabsProps extends PropsWithChildren {
  scrollKey: string
  activityBadgeLabel: ComponentProps<typeof TabBarTab>["badgeLabel"]
  discoverBadgeLabel?: ComponentProps<typeof TabBarTab>["badgeLabel"]
  showMultisigBanner?: boolean
  showActivateBanner: boolean
  showTabs: boolean
}

export const RootTabs: FC<RootTabsProps> = ({
  activityBadgeLabel,
  discoverBadgeLabel,
  scrollKey,
  showMultisigBanner,
  showActivateBanner,
  showTabs = true,
  children,
}) => {
  const { scrollRef, scroll } = useScrollRestoration(scrollKey)

  return (
    <WithEscapeWarning>
      <Suspense fallback={<NavigationBarSkeleton />}>
        <AccountNavigationBarContainer scroll={scroll} />
      </Suspense>
      <Suspense fallback={<Flex flex={1} />}>
        <ScrollContainer ref={scrollRef}>{children}</ScrollContainer>
      </Suspense>
      {showMultisigBanner ? (
        <Center backgroundColor="warning.500" width="full" p="13px 10px">
          <L1 color="neutrals.700">
            {showActivateBanner ? (
              <>Not activated</>
            ) : (
              <>You were removed from this multisig</>
            )}
          </L1>
        </Center>
      ) : showTabs ? (
        <>
          <LegalAgreementsBannerContainer />
          <TabBar>
            <TabBarTab
              as={NavLink}
              to={routes.accountTokens()}
              replace
              icon={<WalletIcon />}
              label="Tokens"
            />
            <TabBarTab
              as={NavLink}
              to={routes.accountCollections()}
              replace
              icon={<NftIcon />}
              label="NFTs"
            />
            <TabBarTab
              as={NavLink}
              to={routes.swap()}
              replace
              icon={<SwapIcon />}
              label="Swap"
            />
            <TabBarTab
              as={NavLink}
              to={routes.accountActivity()}
              replace
              icon={<ActivityIcon />}
              badgeLabel={activityBadgeLabel}
              badgeDescription={"Pending transactions"}
              label="Activity"
            />
            <TabBarTab
              as={NavLink}
              to={routes.accountDiscover()}
              replace
              icon={<FlameIcon />}
              badgeLabel={discoverBadgeLabel}
              badgeDescription={"New items"}
              label="Discover"
            />
          </TabBar>
        </>
      ) : null}
    </WithEscapeWarning>
  )
}
