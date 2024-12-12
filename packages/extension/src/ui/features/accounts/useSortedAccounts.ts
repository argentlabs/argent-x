import { useMemo } from "react"
import type { WalletAccount } from "../../../shared/wallet.model"
import { mapWalletAccountsToAccounts } from "./accounts.state"
import { getPartitionedAccountsByType } from "./usePartitionedAccountsByType"

export const getSortedAccounts = (accounts: WalletAccount[]) => {
  const walletAccounts = mapWalletAccountsToAccounts(accounts)
  const { multisigAccounts, standardAccounts, importedAccounts } =
    getPartitionedAccountsByType(walletAccounts)

  return [...standardAccounts, ...importedAccounts, ...multisigAccounts]
}

export const useSortedAccounts = (accounts: WalletAccount[]) => {
  return useMemo(() => getSortedAccounts(accounts), [accounts])
}
