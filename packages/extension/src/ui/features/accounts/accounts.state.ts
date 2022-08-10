import { useMemo } from "react"
import create from "zustand"

import {
  getNetworkSelector,
  withHiddenSelector,
  withoutHiddenSelector,
} from "../../../shared/account/selectors"
import { accountStore } from "../../../shared/account/store"
import { defaultNetwork } from "../../../shared/network"
import { useArrayStorage } from "../../../shared/storage/hooks"
import { BaseWalletAccount, WalletAccount } from "../../../shared/wallet.model"
import { accountsEqual } from "../../../shared/wallet.service"
import { useCurrentNetwork } from "../networks/useNetworks"
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
        type: walletAccount.type,
      }),
  )
}

export const useAccounts = ({
  showHidden = false,
  allNetworks = false,
} = {}) => {
  const network = useCurrentNetwork()
  const accounts = useArrayStorage(accountStore)

  const filteredAccounts = useMemo(
    () =>
      accounts
        .filter(
          allNetworks
            ? () => true
            : getNetworkSelector(network.id ?? defaultNetwork.id),
        )
        .filter(showHidden ? withHiddenSelector : withoutHiddenSelector),
    [network.id, showHidden, allNetworks, accounts],
  )

  return useMemo(() => {
    return mapWalletAccountsToAccounts(filteredAccounts)
  }, [filteredAccounts])
}

export const useAccount = (
  account?: BaseWalletAccount,
): Account | undefined => {
  const accounts = useAccounts({ allNetworks: true, showHidden: true })
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
  const allAccounts = useAccounts({ showHidden: true })
  const selectedAccount = useSelectedAccountStore(
    (state) => state.selectedAccount,
  )
  return useMemo(() => {
    return allAccounts.find(
      (a) => selectedAccount && accountsEqual(a, selectedAccount),
    )
  }, [allAccounts, selectedAccount])
}
