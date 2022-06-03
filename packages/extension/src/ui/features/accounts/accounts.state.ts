import create from "zustand"

import { Account } from "./Account"

interface State {
  accounts: Record<string, Account>
  selectedAccount?: string
  addAccount: (newAccount: Account) => void
  hiddenAccounts: string[]
  hideAccount: (account: Account) => void
  showMigrationScreen?: boolean // FIXME: remove this when Cairo 9 hits mainnet
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
  hiddenAccounts: [],
  hideAccount: (account: Account) =>
    set((state) => ({
      hiddenAccounts: [...state.hiddenAccounts, account.address],
    })),
}))

export const useAccount = (address: string): Account | undefined =>
  useAccounts(({ accounts }) => accounts[address])

export const useSelectedAccount = () =>
  useAccounts(({ accounts, selectedAccount }) =>
    selectedAccount ? accounts[selectedAccount] : undefined,
  )
