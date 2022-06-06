import { useEffect } from "react"
import useSWRImmutable from "swr/immutable"
import create from "zustand"

import { messageStream } from "../../../shared/messages"
import { WalletAccount } from "../../../shared/wallet.model"
import { getAccounts } from "../../services/backgroundAccounts"
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

export const useAccountSubscription = () => {
  const { data: accounts = [] } = useSWRImmutable("accounts", getAccounts, {
    suspense: true,
  })

  useEffect(() => {
    useAccounts.setState({
      accounts: reduceWalletAccountsToAccounts(accounts),
    })

    const subscription = messageStream.subscribe(([message]) => {
      if (message.type === "HIDE_ACCOUNT_RES") {
        useAccounts.setState({
          accounts: reduceWalletAccountsToAccounts(message.data),
        })
      }

      return () => {
        if (!subscription.closed) {
          subscription.unsubscribe()
        }
      }
    })
  }, [])
}
