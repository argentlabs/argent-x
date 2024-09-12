import { useMemo } from "react"
import { accountsEqual } from "../../../../shared/utils/accountsEqual"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { noUpgradeBannerAccountsView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"

export const useHasDismissedUpgradeBanner = (
  account?: BaseWalletAccount,
): boolean => {
  const noUpgradeBannerAccounts = useView(noUpgradeBannerAccountsView)
  const hasDismissedUpgradeBanner = useMemo(() => {
    if (!account) {
      return false
    }
    return noUpgradeBannerAccounts.some((dismissedUpgradeBannerAccount) => {
      return accountsEqual(dismissedUpgradeBannerAccount, account)
    })
  }, [noUpgradeBannerAccounts, account])

  return hasDismissedUpgradeBanner
}
