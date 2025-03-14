import { classHashSupportsTxV3 } from "@argent/x-shared"
import { useMemo } from "react"
import { selectedAccountView } from "../../views/account"
import { executeFromOutsidePendingActivityForAccountView } from "../../views/activityCache"
import { discoverDataView, discoverViewedAtView } from "../../views/discover"
import { useView } from "../../views/implementation/react"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import {
  isSignerInMultisigView,
  multisigView,
} from "../multisig/multisig.state"
import { useMultisigPendingOffchainSignaturesByAccount } from "../multisig/multisigOffchainSignatures.state"
import { useMultisigPendingTransactionsAwaitingConfirmation } from "../multisig/multisigTransactions.state"
import { RootTabs } from "./RootTabs"

export const RootTabsContainer = () => {
  const account = useView(selectedAccountView)

  // TODO: refactor multisig to use services and views
  const multisig = useView(multisigView(account))
  const signerIsInMultisig = useView(isSignerInMultisigView(account))

  // TODO: refactor activity/transactions to use services and views
  const { pendingTransactions } = useAccountTransactions(account)
  const pendingMultisigTransactions =
    useMultisigPendingTransactionsAwaitingConfirmation(account)
  const pendingMultisigOffchainSignatures =
    useMultisigPendingOffchainSignaturesByAccount(account)

  // these activities don't have related pending transactions
  const pendingExecuteFromOutsideActivities = useView(
    executeFromOutsidePendingActivityForAccountView(account),
  )

  const accountSupportsTxV3 = classHashSupportsTxV3(account?.classHash)

  const showActivateBanner = Boolean(multisig?.needsDeploy) // False if multisig is undefined

  const activateAccountTokens = showActivateBanner
    ? accountSupportsTxV3
      ? "STRK"
      : "ETH"
    : undefined

  const showSignerIsRemovedBanner = !signerIsInMultisig
  const showMultisigBanner =
    multisig && (showActivateBanner || showSignerIsRemovedBanner)

  const showTabs = Boolean(account)

  const totalPendingTransactions =
    pendingTransactions.length +
    pendingMultisigTransactions.length +
    pendingMultisigOffchainSignatures.length +
    (pendingExecuteFromOutsideActivities?.length ?? 0)

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
      activateAccountTokens={activateAccountTokens}
    />
  )
}
