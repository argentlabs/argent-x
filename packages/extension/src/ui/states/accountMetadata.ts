import create from "zustand"
import { persist } from "zustand/middleware"

import type { Wallet } from "../Wallet"

// account information that's not saved in the backup file, but persisted in the extension's localstorage
interface State {
  accountNames: Record<string, Record<string, string>>
  setAccountName: (netowrkId: string, address: string, name: string) => void
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
  { address, networkId }: Wallet,
  accountNames: Record<string, Record<string, string>>,
): string => accountNames[networkId]?.[address] || "Unnamed account"

export const setDefaultAccountNames = (accounts: Record<string, Wallet>) => {
  const { accountNames } = useAccountMetadata.getState()
  let names = accountNames
  for (const [address, account] of Object.entries(accounts)) {
    const { networkId } = account
    if (!accountNames?.[networkId]?.[address]) {
      const name = getDefaultAccountName(account)
      names = {
        ...names,
        [networkId]: { ...names[networkId], [address]: name },
      }
    }
  }
  if (names !== accountNames) {
    useAccountMetadata.setState({ accountNames: names })
  }
}

const getDefaultAccountName = (account: Wallet) => {
  const names = Object.values(
    useAccountMetadata.getState().accountNames[account.networkId] || {},
  )
  let index = 1
  while (names.includes(`Account ${index}`)) {
    index++
  }
  return `Account ${index}`
}
