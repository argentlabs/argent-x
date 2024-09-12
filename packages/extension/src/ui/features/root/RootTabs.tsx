import { L1, TabBarTab, TabBar, iconsDeprecated } from "@argent/x-ui"
import { Center } from "@chakra-ui/react"
import { ComponentProps, FC } from "react"
import { NavLink } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { LegalAgreementsBannerContainer } from "../legal/LegalAgreementsBannerContainer"
import { ampli } from "../../../shared/analytics"

const { WalletIcon, NftIcon, ActivityIcon, SwapIcon, FlameIcon } =
  iconsDeprecated

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
          <L1 color="neutrals.700">
            {showActivateBanner ? (
              <>Add {activateAccountTokens} and activate</>
            ) : (
              <>You were removed from this multisig</>
            )}
          </L1>
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
              onClick={() =>
                void ampli.swapTabClicked({
                  "wallet platform": "browser extension",
                })
              }
              label="Swap"
            />
            <TabBarTab
              as={NavLink}
              to={routes.accountActivity()}
              replace
              icon={<ActivityIcon />}
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
              icon={<FlameIcon />}
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
