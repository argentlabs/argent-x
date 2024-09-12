import { FC } from "react"

import { routes } from "../../../shared/ui/routes"
import { Multisig } from "../multisig/Multisig"
import { MultisigBanner } from "../multisig/MultisigBanner"
import { EscapeBanner } from "../smartAccount/escape/EscapeBanner"
import { StatusMessageBannerContainer } from "../statusMessage/StatusMessageBannerContainer"
import { SaveRecoverySeedphraseBanner } from "./SaveRecoverySeedphraseBanner"
import { UpgradeBannerContainer } from "./UpgradeBannerContainer"
import { AccountDeprecatedBanner } from "./warning/AccountDeprecatedBanner"
import { AccountOwnerBanner } from "./warning/AccountOwnerBanner"
import { WalletAccount } from "../../../shared/wallet.model"

export interface AccountBannersProps {
  account: WalletAccount
  hasEscape: boolean
  accountGuardianIsSelf: boolean | null
  accountOwnerIsSelf?: boolean
  multisig?: Multisig
  hasFeeTokenBalance?: boolean
  showSaveRecoverySeedphraseBanner: boolean
  isDeprecated?: boolean
  onAvnuClick?: () => void
  returnTo?: string
}

export const AccountBanners: FC<AccountBannersProps> = ({
  account,
  hasEscape,
  accountGuardianIsSelf,
  accountOwnerIsSelf,
  multisig,
  hasFeeTokenBalance,
  showSaveRecoverySeedphraseBanner,
  isDeprecated = false,
  returnTo,
}) => {
  return (
    <>
      {showSaveRecoverySeedphraseBanner && <SaveRecoverySeedphraseBanner />}
      <StatusMessageBannerContainer />
      {(hasEscape || accountGuardianIsSelf) && (
        <EscapeBanner account={account} />
      )}
      <UpgradeBannerContainer
        account={account}
        multisig={multisig}
        allowDismissBanner
      />
      {isDeprecated && (
        <AccountDeprecatedBanner
          to={routes.accountDeprecated(returnTo)}
          state={{ from: location.pathname }}
        />
      )}
      {!accountOwnerIsSelf && (
        <AccountOwnerBanner to={routes.accountOwnerWarning(returnTo)} />
      )}
      {multisig && (
        <MultisigBanner
          multisig={multisig}
          hasFeeTokenBalance={hasFeeTokenBalance}
        />
      )}
    </>
  )
}
