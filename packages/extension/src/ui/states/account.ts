import create from "zustand"

import { Account } from "../Account"

interface State {
  accounts: Record<string, Account>
  selectedAccount?: string
  addAccount: (newAccount: Account) => void
}

export const useAccount = create<State>((set) => ({
  accounts: {},
  addAccount: (newAccount: Account) =>
    set((state) => ({
      selectedAccount: newAccount.address,
      accounts: {
        ...state.accounts,
        [newAccount.address]: newAccount,
      },
    })),
}))

export const selectAccount = ({ accounts, selectedAccount }: State) => {
  if (selectedAccount) {
    return accounts[selectedAccount]
  }
}
