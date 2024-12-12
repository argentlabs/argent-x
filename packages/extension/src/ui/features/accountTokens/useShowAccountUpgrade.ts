import { useMemo } from "react"
import type { BaseWalletAccount } from "../../../shared/wallet.model"
import { useHasPendingUpgradeAccountTransactions } from "../accounts/accountTransactions.state"
import {
  useCheckUpgradeAvailable,
  useIsDeprecatedTxV0,
} from "../accounts/accountUpgradeCheck"
import { useWalletAccount } from "../accounts/accounts.state"
import { useIsMultisigDeploying } from "../multisig/hooks/useIsMultisigDeploying"
import { multisigView } from "../multisig/multisig.state"
import { useHasFeeTokenBalance } from "./useFeeTokenBalance"
import { useView } from "../../views/implementation/react"
import {
  isArgentAccount,
  isImportedArgentAccount,
} from "../../../shared/utils/isExternalAccount"

export const useShowAccountUpgrade = (baseAccount?: BaseWalletAccount) => {
  const account = useWalletAccount(baseAccount?.id)
  const multisig = useView(multisigView(account))

  const hasPendingUpgradeTransactions =
    useHasPendingUpgradeAccountTransactions(account)

  const isMultisigDeploying = useIsMultisigDeploying(multisig)
  const needsUpgrade = useCheckUpgradeAvailable(account)

  const hasFeeTokenBalance = useHasFeeTokenBalance(account)

  const isDeprecated = useIsDeprecatedTxV0(account)

  const isUpgradableAccount = useMemo(
    () =>
      account && (isArgentAccount(account) || isImportedArgentAccount(account)),
    [account],
  )

  return useMemo(
    () =>
      account && // account is loaded
      hasFeeTokenBalance && // account has enough balance to pay the fee
      needsUpgrade && // account needs upgrade
      isUpgradableAccount && // account is not an imported non-Argent account
      !account.needsDeploy && // account is deployed
      !hasPendingUpgradeTransactions && // no pending upgrade transactions
      !isMultisigDeploying && // if account is multisig, it's not deploying
      !isDeprecated, // account is not deprecated
    [
      account,
      hasFeeTokenBalance,
      hasPendingUpgradeTransactions,
      isDeprecated,
      isMultisigDeploying,
      isUpgradableAccount,
      needsUpgrade,
    ],
  )
}
