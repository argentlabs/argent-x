import create from "zustand"

import { Account } from "./Account"

interface State {
  accounts: Record<string, Account>
  selectedAccount?: string
  addAccount: (newAccount: Account) => void
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
}))

export const useAccount = (address: string): Account | undefined =>
  useAccounts(({ accounts }) => accounts[address])

export const useSelectedAccount = () =>
  useAccounts(({ accounts, selectedAccount }) =>
    selectedAccount ? accounts[selectedAccount] : undefined,
  )
