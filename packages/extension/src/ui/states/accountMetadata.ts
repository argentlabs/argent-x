import create from "zustand"
import { persist } from "zustand/middleware"

import type { Account } from "../Account"

// account information that's not saved in the backup file, but persisted in the extension's localstorage
interface State {
  accountNames: Record<string, Record<string, string>>
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
  { address, networkId }: Account,
  accountNames: Record<string, Record<string, string>>,
): string => accountNames[networkId]?.[address] || "Unnamed account"

export const setDefaultAccountNames = (accounts: Record<string, Account>) => {
  const { accountNames } = useAccountMetadata.getState()
  let names = accountNames
  for (const [address, account] of Object.entries(accounts)) {
    const { networkId } = account
    if (!names[networkId]?.[address]) {
      const name = `Account ${Object.keys(accounts).indexOf(address) + 1}`
      names = {
        ...names,
        [networkId]: { ...names[networkId], [address]: name },
      }
    }
  }
  useAccountMetadata.setState({ accountNames: names })
}
