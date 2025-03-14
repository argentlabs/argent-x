import type { AccountId } from "../../../shared/wallet.model"
import {
  accountFindFamily,
  allAccountsOnNetworkFamily,
} from "../../views/account"
import { useView } from "../../views/implementation/react"

export const useWalletAccount = (account?: AccountId) => {
  return useView(accountFindFamily(account))
}

export const useAccountsOnNetwork = (networkId: string) => {
  return useView(allAccountsOnNetworkFamily(networkId))
}
