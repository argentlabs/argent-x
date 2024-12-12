import { partition } from "lodash-es"

import type { WalletAccount } from "../../wallet.model"

export const updateAccountsWithNames = (accounts: WalletAccount[]) => {
  const [multisigAccounts, standardAccounts] = partition(
    accounts,
    (account) => account.type === "multisig",
  )

  const updatedMultisigAccounts = multisigAccounts.map((multisig, index) => ({
    ...multisig,
    name: `Multisig ${index + 1}`,
  }))

  const updatedStandardAccounts = standardAccounts.map((account, index) => ({
    ...account,
    name: `Account ${index + 1}`,
  }))

  return [...updatedStandardAccounts, ...updatedMultisigAccounts]
}
