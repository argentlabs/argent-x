import { FC, useMemo } from "react"

import { useCurrentPathnameWithQuery } from "../../hooks/useRoute"
import { hasSavedRecoverySeedPhraseView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useIsDeprecatedTxV0 } from "../accounts/accountUpgradeCheck"
import { useAccountOwnerIsSelf } from "../accounts/useAccountOwner"
import { multisigView } from "../multisig/multisig.state"
import { useIsMainnet } from "../networks/hooks/useIsMainnet"
import { accountHasEscape } from "../smartAccount/escape/accountHasEscape"
import { useAccountGuardianIsSelf } from "../smartAccount/useAccountGuardian"
import { useHasFeeTokenBalance } from "./useFeeTokenBalance"
import { WalletAccount } from "../../../shared/wallet.model"
import { AccountBanners } from "./AccountBanners"

interface AccountBannersContainerProps {
  account: WalletAccount
}

export const AccountBannersContainer: FC<AccountBannersContainerProps> = ({
  account,
}) => {
  const returnTo = useCurrentPathnameWithQuery()
  const hasSavedRecoverySeedPhrase = useView(hasSavedRecoverySeedPhraseView)
  const isMainnet = useIsMainnet()

  const hasFeeTokenBalance = useHasFeeTokenBalance(account)

  const multisig = useView(multisigView(account))

  const hasEscape = accountHasEscape(account)
  const accountGuardianIsSelf = useAccountGuardianIsSelf(account)
  const accountOwnerIsSelf = useAccountOwnerIsSelf(account)

  const isDeprecated = useIsDeprecatedTxV0(account)

  const showSaveRecoverySeedphraseBanner = useMemo(() => {
    return !hasSavedRecoverySeedPhrase && isMainnet
  }, [hasSavedRecoverySeedPhrase, isMainnet])

  return (
    <AccountBanners
      account={account}
      hasEscape={hasEscape}
      accountGuardianIsSelf={accountGuardianIsSelf}
      accountOwnerIsSelf={accountOwnerIsSelf}
      multisig={multisig}
      hasFeeTokenBalance={hasFeeTokenBalance}
      showSaveRecoverySeedphraseBanner={showSaveRecoverySeedphraseBanner}
      isDeprecated={isDeprecated}
      returnTo={returnTo}
    />
  )
}
