import create from "zustand"

import { Account } from "./Account"

interface State {
  accounts: { [address: string]: Account }
  selectedAccount?: string
  addAccount: (newAccount: Account) => void
  hideAccount: (account: Account) => void
}

export const useAccounts = create<State>((set) => ({
  accounts: {},
  addAccount: (newAccount: Account) =>
    set((state) => ({
      selectedAccount: newAccount.address,
      accounts: {
        ...state.accounts,
        [newAccount.address]: newAccount,
      },
    })),
  hideAccount: (accountToHide: Account) =>
    set((state) => {
      const updatedAccounts = Object.entries(state.accounts)
        .filter(([address, _]) => address !== accountToHide.address)
        .reduce((acc, [address, account]) => {
          return { ...acc, [address]: account }
        }, {})

      return { accounts: updatedAccounts }
    }),
}))

export const useAccount = (address: string): Account | undefined =>
  useAccounts(({ accounts }) => accounts[address])

export const useSelectedAccount = () =>
  useAccounts(({ accounts, selectedAccount }) =>
    selectedAccount ? accounts[selectedAccount] : undefined,
  )
