import type { ReactNode } from "react"
import { useMemo } from "react"

import { routes } from "../../../shared/ui/routes"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useCurrentPathnameWithQuery } from "../../hooks/useRoute"
import { useStatusMessage } from "../statusMessage/useStatusMessage"
import {
  AccountDeprecatedBanner,
  useShowDeprecatedBanner,
} from "./AccountDeprecatedBanner"
import {
  AccountOwnerBanner,
  useShowAccountOwnerBanner,
} from "./AccountOwnerBanner"
import {
  EscapeBannerContainer,
  useShowEscapeBanner,
} from "./EscapeBannerContainer"
import {
  MultisigBannerContainer,
  useShowMultisigBanner,
} from "./MultisigBannerContainer"
import {
  StatusMessageBannerContainer,
  useShowStatusMessageBanner,
} from "./StatusMessageBannerContainer"
import {
  UpgradeBannerContainer,
  useShowUpgradeBanner,
} from "./UpgradeBannerContainer"
import {
  PromoStakingBannerContainer,
  useShowPromoStakingBanner,
} from "./PromoStakingBannerContainer"
import { useWstEthBanner, WstEthBannerContainer } from "./WstEthBannerContainer"
import {
  LegacyVersionBannerContainer,
  useShowLegacyVersionBanner,
} from "./LegacyVersionBannerContainer"

export const useBanners = (account: WalletAccount) => {
  const returnTo = useCurrentPathnameWithQuery()

  const statusMessage = useStatusMessage()
  const isCriticalStatusMessage = statusMessage?.level === "danger"

  const showStatusMessageBanner = useShowStatusMessageBanner()
  const showEscapeBanner = useShowEscapeBanner(account)
  const showUpgradeBanner = useShowUpgradeBanner(account)
  const showDeprecatedBanner = useShowDeprecatedBanner(account)
  const showAccountOwnerBanner = useShowAccountOwnerBanner(account)
  const showMultisigBanner = useShowMultisigBanner(account)
  const showPromoStakingBanner = useShowPromoStakingBanner()
  const showLegacyVersionBanner = useShowLegacyVersionBanner(account)

  const showWstETHBanner = useWstEthBanner(account)

  const banners = useMemo(() => {
    const banners: ReactNode[] = []
    if (showEscapeBanner) {
      banners.push(<EscapeBannerContainer account={account} />)
    }
    if (showStatusMessageBanner) {
      if (isCriticalStatusMessage) {
        // show critical status message first
        banners.unshift(<StatusMessageBannerContainer />)
      } else {
        banners.push(<StatusMessageBannerContainer />)
      }
    }
    if (showUpgradeBanner && !showLegacyVersionBanner) {
      banners.push(<UpgradeBannerContainer account={account} />)
    }
    if (showDeprecatedBanner) {
      banners.push(
        <AccountDeprecatedBanner
          to={routes.accountDeprecated(returnTo)}
          state={{ from: location.pathname }}
        />,
      )
    }
    if (showAccountOwnerBanner) {
      banners.push(
        <AccountOwnerBanner to={routes.accountOwnerWarning(returnTo)} />,
      )
    }
    if (showMultisigBanner) {
      banners.push(<MultisigBannerContainer account={account} />)
    }

    if (showWstETHBanner) {
      banners.push(<WstEthBannerContainer account={account} />)
    }

    if (showPromoStakingBanner) {
      banners.push(<PromoStakingBannerContainer />)
    }

    if (showLegacyVersionBanner) {
      banners.unshift(<LegacyVersionBannerContainer account={account} />)
    }

    return banners
  }, [
    showEscapeBanner,
    showStatusMessageBanner,
    showUpgradeBanner,
    showDeprecatedBanner,
    showAccountOwnerBanner,
    showMultisigBanner,
    showWstETHBanner,
    showPromoStakingBanner,
    showLegacyVersionBanner,
    account,
    isCriticalStatusMessage,
    returnTo,
  ])

  return banners
}
