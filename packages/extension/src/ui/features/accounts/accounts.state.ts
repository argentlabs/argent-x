import { find } from "lodash-es"
import create from "zustand"

import { BaseWalletAccount, WalletAccount } from "../../../shared/wallet.model"
import { accountsEqual } from "../../../shared/wallet.service"
import { Account } from "./Account"

interface State {
  accounts: Account[]
  selectedAccount?: BaseWalletAccount
  addAccount: (newAccount: Account) => void
  showMigrationScreen?: boolean // FIXME: remove when depricated accounts do not longer work
}

export const initialState = {
  accounts: [],
  selectedAccount: undefined,
}

export const useAccounts = create<State>((set) => ({
  ...initialState,
  addAccount: (newAccount: Account) =>
    set((state) => ({
      selectedAccount: newAccount,
      accounts: [...state.accounts, newAccount],
    })),
}))

export const useAccount = (account?: BaseWalletAccount): Account | undefined =>
  useAccounts(({ accounts }) =>
    find(accounts, (a) => {
      if (!account) {
        return false
      }
      return accountsEqual(a, account)
    }),
  )

const visibleAccountsSelector = ({ accounts }: Pick<State, "accounts">) =>
  accounts.filter((account) => !account.hidden)

const hiddenAccountsSelector = ({ accounts }: Pick<State, "accounts">) =>
  accounts.filter((account) => account.hidden)

export const useVisibleAccounts = () => {
  return useAccounts(visibleAccountsSelector)
}

export const useHiddenAccounts = () => {
  return useAccounts(hiddenAccountsSelector)
}

export const useSelectedAccount = () =>
  useAccounts(({ accounts, selectedAccount }) =>
    selectedAccount
      ? find(accounts, (account) => accountsEqual(account, selectedAccount))
      : undefined,
  )

export const mapWalletAccountsToAccounts = (
  walletAccounts: WalletAccount[],
): State["accounts"] => {
  return walletAccounts.map(
    (walletAccount) =>
      new Account({
        address: walletAccount.address,
        network: walletAccount.network,
        signer: walletAccount.signer,
        hidden: walletAccount.hidden,
      }),
  )
}
