import find from "lodash-es/find"
import create from "zustand"

import {
  UniqueAccount,
  WalletAccount,
  accountsEqual,
} from "../../../shared/wallet.model"
import { Account } from "./Account"

interface State {
  accounts: Record<string, Account>
  selectedAccount?: UniqueAccount
  addAccount: (newAccount: Account) => void
  showMigrationScreen?: boolean // FIXME: remove when depricated accounts do not longer work
}

export const initialState = {
  accounts: {},
  selectedAccount: undefined,
}

export const useAccounts = create<State>((set) => ({
  ...initialState,
  addAccount: (newAccount: Account) =>
    set((state) => ({
      selectedAccount: newAccount,
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
    selectedAccount
      ? find(accounts, (x) => accountsEqual(x, selectedAccount))
      : undefined,
  )

export const reduceWalletAccountsToAccounts = (
  walletAccounts: WalletAccount[],
) => {
  return walletAccounts.reduce<State["accounts"]>(
    (allAccounts, walletAccount) => {
      return {
        ...allAccounts,
        [walletAccount.address]: new Account(
          walletAccount.address,
          walletAccount.network,
          walletAccount.signer,
        ),
      }
    },
    {},
  )
}
