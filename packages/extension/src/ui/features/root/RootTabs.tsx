import {
  WalletPrimaryIcon,
  ActivityPrimaryIcon,
  HotPrimaryIcon,
  SwapPrimaryIcon,
} from "@argent/x-ui/icons"
import { L1Bold, TabBar, TabBarTab } from "@argent/x-ui"
import { Center } from "@chakra-ui/react"
import type { ComponentProps, FC } from "react"
import { NavLink } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { LegalAgreementsBannerContainer } from "../legal/LegalAgreementsBannerContainer"
import { ampli } from "../../../shared/analytics"

interface RootTabsProps {
  activityBadgeLabel: ComponentProps<typeof TabBarTab>["badgeLabel"]
  discoverBadgeLabel?: ComponentProps<typeof TabBarTab>["badgeLabel"]
  showMultisigBanner?: boolean
  showActivateBanner: boolean
  showTabs: boolean
  showPrivacyBanner?: boolean
  activateAccountTokens?: string
}

export const RootTabs: FC<RootTabsProps> = ({
  activityBadgeLabel,
  discoverBadgeLabel,
  showMultisigBanner,
  showActivateBanner,
  showTabs = true,
  showPrivacyBanner = false,
  activateAccountTokens = "ETH",
}) => {
  return (
    <>
      {showMultisigBanner ? (
        <Center backgroundColor="warning.500" width="full" p="13px 10px">
          <L1Bold color="neutrals.700">
            {showActivateBanner ? (
              <>Add {activateAccountTokens} and activate</>
            ) : (
              <>You were removed from this multisig</>
            )}
          </L1Bold>
        </Center>
      ) : showTabs ? (
        <>
          {showPrivacyBanner && <LegalAgreementsBannerContainer />}
          <TabBar>
            <TabBarTab
              as={NavLink}
              to={routes.accountTokens()}
              onClick={() =>
                void ampli.homeTabClicked({
                  "wallet platform": "browser extension",
                })
              }
              replace
              icon={<WalletPrimaryIcon />}
              label="Tokens"
            />
            <TabBarTab
              as={NavLink}
              to={routes.swapToken()}
              onClick={() =>
                void ampli.swapTabClicked({
                  "wallet platform": "browser extension",
                  "swap entered from": "swap tab",
                })
              }
              replace
              icon={<SwapPrimaryIcon />}
              label="Swap"
            />
            <TabBarTab
              as={NavLink}
              to={routes.accountActivity()}
              replace
              icon={<ActivityPrimaryIcon />}
              badgeLabel={activityBadgeLabel}
              onClick={() =>
                void ampli.activityTabClicked({
                  "wallet platform": "browser extension",
                })
              }
              badgeDescription={"Pending transactions"}
              label="Activity"
            />
            <TabBarTab
              as={NavLink}
              to={routes.accountDiscover()}
              replace
              icon={<HotPrimaryIcon />}
              badgeLabel={discoverBadgeLabel}
              onClick={() =>
                void ampli.discoverTabClicked({
                  "wallet platform": "browser extension",
                })
              }
              badgeDescription={"New items"}
              label="Discover"
            />
          </TabBar>
        </>
      ) : null}
    </>
  )
}
