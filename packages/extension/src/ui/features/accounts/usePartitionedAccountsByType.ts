import { useMemo } from "react"

import {
  sortImportedAccounts,
  sortMultisigAccounts,
  sortStandardAccounts,
} from "../../../shared/utils/accountsMultisigSort"
import type { WalletAccount } from "../../../shared/wallet.model"

export const getPartitionedAccountsByType = (accounts: WalletAccount[]) => {
  const partitionedAccounts = accounts.reduce<{
    multisig: WalletAccount[]
    standard: WalletAccount[]
    imported: WalletAccount[]
  }>(
    (acc, account) => {
      if (account.type === "multisig") {
        acc.multisig.push(account)
      } else if (account.type === "imported") {
        acc.imported.push(account)
      } else {
        acc.standard.push(account)
      }
      return acc
    },
    { multisig: [], standard: [], imported: [] },
  )

  return {
    multisigAccounts: sortMultisigAccounts(partitionedAccounts.multisig),
    standardAccounts: sortStandardAccounts(partitionedAccounts.standard),
    importedAccounts: sortImportedAccounts(partitionedAccounts.imported),
  }
}

export const usePartitionedAccountsByType = (accounts: WalletAccount[]) => {
  return useMemo(() => getPartitionedAccountsByType(accounts), [accounts])
}
