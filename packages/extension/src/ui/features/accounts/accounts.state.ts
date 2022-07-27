import { useMemo } from "react"
import create from "zustand"

import {
  withHiddenSelector,
  withoutHiddenSelector,
} from "../../../shared/account/selectors"
import { accountStore } from "../../../shared/account/store"
import { useArrayStorage } from "../../../shared/storage/hooks"
import { BaseWalletAccount, WalletAccount } from "../../../shared/wallet.model"
import { accountsEqual } from "../../../shared/wallet.service"
import { Account } from "./Account"

export const mapWalletAccountsToAccounts = (
  walletAccounts: WalletAccount[],
): Account[] => {
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

export const useAccounts = (showHidden = false) => {
  const accounts = useArrayStorage(
    accountStore,
    showHidden ? withHiddenSelector : withoutHiddenSelector,
  )

  return useMemo(() => {
    return mapWalletAccountsToAccounts(accounts)
  }, [accounts])
}

export const useAccount = (
  account?: BaseWalletAccount,
): Account | undefined => {
  const accounts = useAccounts(true)
  return useMemo(() => {
    return accounts.find((a) => account && accountsEqual(a, account))
  }, [accounts, account])
}

export const isHiddenAccount = (account: Account) => !!account.hidden

interface State {
  selectedAccount?: BaseWalletAccount
  showMigrationScreen?: boolean // FIXME: remove when depricated accounts do not longer work
}

export const useSelectedAccountStore = create<State>(() => ({}))

export const useSelectedAccount = () => {
  const allAccounts = useAccounts(true)
  const selectedAccount = useSelectedAccountStore(
    (state) => state.selectedAccount,
  )
  return useMemo(() => {
    return allAccounts.find(
      (a) => selectedAccount && accountsEqual(a, selectedAccount),
    )
  }, [allAccounts, selectedAccount])
}
