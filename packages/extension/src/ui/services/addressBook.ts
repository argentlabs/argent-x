import { useAccounts } from "../features/accounts/accounts.state"

export const useAddressBook = (networkId: string) => {
  // TODO: Implement actual address book
  const allAccountsOnNetwork = useAccounts().accounts.filter(
    (account) => account.networkId === networkId,
  )

  return allAccountsOnNetwork
}
