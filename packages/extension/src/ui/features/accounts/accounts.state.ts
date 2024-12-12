import type { AccountId, WalletAccount } from "../../../shared/wallet.model"
import {
  accountFindFamily,
  allAccountsOnNetworkFamily,
} from "../../views/account"
import { useView } from "../../views/implementation/react"
import { Account } from "./Account"

// This file is used everywhere
// TODO: we should get rid of this and use the WalletAccount interface only (renaming it at some point)
export const mapWalletAccountsToAccounts = (
  walletAccounts: WalletAccount[],
): Account[] => walletAccounts.map(Account.fromWalletAccount)

export const useWalletAccount = (account?: AccountId) => {
  return useView(accountFindFamily(account))
}

export const useAccountsOnNetwork = (networkId: string) => {
  return useView(allAccountsOnNetworkFamily(networkId))
}
