import { useMemo } from "react"
import type { WalletAccount } from "../../../shared/wallet.model"
import { getPartitionedAccountsByType } from "./usePartitionedAccountsByType"

export const getSortedAccounts = (accounts: WalletAccount[]) => {
  const { multisigAccounts, standardAccounts, importedAccounts } =
    getPartitionedAccountsByType(accounts)

  return [...standardAccounts, ...importedAccounts, ...multisigAccounts]
}

export const useSortedAccounts = (accounts: WalletAccount[]) => {
  return useMemo(() => getSortedAccounts(accounts), [accounts])
}
