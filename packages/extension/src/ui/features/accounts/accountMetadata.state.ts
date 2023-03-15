import { groupBy } from "lodash-es"
import create from "zustand"
import { persist } from "zustand/middleware"

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

export const getAccountName = (
  { address, network }: Account,
  accountNames: AccountNames = {},
): string => accountNames[network.id]?.[address] || defaultAccountName

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
