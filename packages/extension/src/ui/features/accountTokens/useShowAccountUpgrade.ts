import { useMemo } from "react"
import { BaseWalletAccount } from "../../../shared/wallet.model"
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

export const useShowAccountUpgrade = (baseAccount?: BaseWalletAccount) => {
  const account = useWalletAccount(baseAccount)
  const multisig = useView(multisigView(account))

  const hasPendingUpgradeTransactions =
    useHasPendingUpgradeAccountTransactions(account)

  const isMultisigDeploying = useIsMultisigDeploying(multisig)
  const needsUpgrade = useCheckUpgradeAvailable(account)

  const hasFeeTokenBalance = useHasFeeTokenBalance(account)

  const isDeprecated = useIsDeprecatedTxV0(account)

  return useMemo(
    () =>
      account && // account is loaded
      hasFeeTokenBalance && // account has enough balance to pay the fee
      needsUpgrade && // account needs upgrade
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
      needsUpgrade,
    ],
  )
}
