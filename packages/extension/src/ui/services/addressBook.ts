import { BaseWalletAccount } from "../../shared/wallet.model"
import { useAccounts } from "../features/accounts/accounts.state"

export const useAddressBook = (
  networkId: string,
  excludeAccounts: BaseWalletAccount[] = [],
) => {
  // TODO: Implement actual address book
  const allAccountsOnNetwork = useAccounts()
    .filter(
      // all accounts on this network
      (account) => account.networkId === networkId,
    )
    .filter(
      // exclude excludeAccounts
      (account) => !excludeAccounts.includes(account),
    )

  return allAccountsOnNetwork
}
