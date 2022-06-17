import { find } from "lodash-es"
import create from "zustand"

import { BaseWalletAccount, WalletAccount } from "../../../shared/wallet.model"
import { accountsEqual } from "../../../shared/wallet.service"
import { Account } from "./Account"

interface State {
  accounts: Record<string, Account>
  selectedAccount?: BaseWalletAccount
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
      ? find(accounts, (account) => accountsEqual(account, selectedAccount))
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
