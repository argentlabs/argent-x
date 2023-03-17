// Write a function that takes in an array of accounts and returns an array of accounts with the name property added to each account. The name property should be the first and last name of the account holder. The function should be able to handle both individual and business accounts.

import { partition } from "lodash-es"

import { WalletAccount } from "../../wallet.model"

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
