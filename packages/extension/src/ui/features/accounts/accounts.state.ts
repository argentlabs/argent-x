import create from "zustand"

import { WalletAccount } from "../../../shared/wallet.model"
import { Account } from "./Account"

interface State {
  accounts: Record<string, Account>
  selectedAccount?: string
  addAccount: (newAccount: Account) => void
  showMigrationScreen?: boolean // FIXME: remove this when Cairo 9 hits mainnet
}

export const initialState = {
  accounts: {},
  selectedAccount: undefined,
}

export const useAccounts = create<State>((set) => ({
  ...initialState,
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
