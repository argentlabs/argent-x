import { groupBy } from "lodash-es"
import create from "zustand"
import { persist } from "zustand/middleware"

import { withHiddenSelector } from "./../../../shared/account/selectors"
import { accountStore } from "../../../shared/account/store"
import type { Account } from "./Account"

export const defaultAccountName = "Unnamed account"

export type AccountNames = {
  [networkId: string]: {
    [accountAddress: string]: string
  }
}

export type AccountNamesByType = {
  [type: string]: AccountNames
}

// account information that's not saved in the backup file, but persisted in the extension's localstorage
interface State {
  accountNames: AccountNames
  setAccountName: (networkId: string, address: string, name: string) => void
}

/**
 * @deprecated Don't use this store anymore. Use account.name instead
 * To update accountName use updateAccountName() from account store file
 */
export const useAccountMetadata = create<State>(
  persist(
    (set, _get) => ({
      accountNames: {},
      setAccountName: (networkId: string, address: string, name: string) =>
        set((state) => ({
          accountNames: {
            ...state.accountNames,
            [networkId]: {
              ...state.accountNames[networkId],
              [address]: name,
            },
          },
        })),
    }),
    { name: "accountMetadata" },
  ),
)

/**
 * @deprecated use account.name instead
 * @param accountNames
 * @returns account name
 */
export const getAccountName = (
  { address, network }: Account,
  accountNames: AccountNames = {},
): string => accountNames[network.id]?.[address] || defaultAccountName

/**
 * @deprecated This is not needed anymore. Name is part of the account object
 * @param accounts
 */
export const setDefaultAccountNames = (accounts: Account[]) => {
  // Group accounts by type such that plugin and argent accounts are grouped together
  // and multisig accounts are grouped together
  const accountsByTypes = groupBy(accounts, (account) =>
    account.type === "multisig" ? "multisig" : "standard",
  )

  // Default account names should be "MultiSig Account 1", "MultiSig Account 2", etc. if they are multisig accounts
  // and "Account 1", "Account 2", etc. if they are not.

  const accountNamesByTypes: AccountNamesByType = {
    standard: {},
    multisig: {},
  }

  const getAccountTypeName = (accountType: string): string =>
    accountType === "multisig" ? "Multisig" : "Account"

  const preMerged = Object.entries(accountsByTypes).reduce<AccountNamesByType>(
    (acc, [type, accounts]) => {
      const accountNames = accounts.reduce<AccountNames>(
        (nestedAcc, account) => {
          const { network, address } = account
          const accountIndex =
            accounts.findIndex((a) => a.address === address) + 1
          const name = `${getAccountTypeName(type)} ${accountIndex}`
          const networkId = network.id

          return {
            ...nestedAcc,
            [networkId]: {
              ...nestedAcc[networkId],
              [address]: name,
            },
          }
        },
        {},
      )

      return {
        ...acc,
        [type]: accountNames,
      }
    },
    accountNamesByTypes,
  )

  const merged = Object.entries(preMerged).reduce<AccountNames>(
    (acc, [_, networks]) => {
      return Object.entries(networks).reduce<AccountNames>(
        (nestedAcc, [networkId, addresses]) => {
          return {
            ...acc,
            ...nestedAcc,
            [networkId]: {
              ...(acc[networkId] || {}), // ensure we don't override existing data
              ...nestedAcc[networkId],
              ...addresses,
            },
          }
        },
        acc,
      )
    },
    {},
  )
  useAccountMetadata.setState({ accountNames: merged })
}

// This is a migration function that migrates the account names from zustand store
// to the WalletAccounts stored in accountStore
// This makes the name a property of the account, and not a separate entity
export async function migrate(accountNames: AccountNames): Promise<string> {
  const walletAccounts = await accountStore.get(withHiddenSelector)

  const hasAccountNames = walletAccounts.every((account) =>
    Boolean(account.name),
  )

  if (hasAccountNames) {
    return "Migration not needed"
  }

  const updatedWalletAccounts = walletAccounts.map((account) => ({
    ...account,
    name: accountNames[account.network.id]?.[account.address],
  }))

  await accountStore.push(updatedWalletAccounts)
  return "Migration successful"
}

migrate(useAccountMetadata.getState().accountNames)
  .then((m) => {
    console.log(m)
  })
  .catch(() => {
    console.error("Migration failed")
  })
