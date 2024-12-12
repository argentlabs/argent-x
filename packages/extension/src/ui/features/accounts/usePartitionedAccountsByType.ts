import { useMemo } from "react"

import {
  sortImportedAccounts,
  sortMultisigAccounts,
  sortStandardAccounts,
} from "../../../shared/utils/accountsMultisigSort"
import type { Account } from "./Account"

export const getPartitionedAccountsByType = (accounts: Account[]) => {
  const partitionedAccounts = accounts.reduce<{
    multisig: Account[]
    standard: Account[]
    imported: Account[]
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

export const usePartitionedAccountsByType = (accounts: Account[]) => {
  return useMemo(() => getPartitionedAccountsByType(accounts), [accounts])
}
