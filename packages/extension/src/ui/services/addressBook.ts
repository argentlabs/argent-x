import { useVisibleAccounts } from "../features/accounts/accounts.state"

export const useAddressBook = (networkId: string) => {
  // TODO: Implement actual address book
  const allAccountsOnNetwork = useVisibleAccounts().filter(
    (account) => account.networkId === networkId,
  )

  return allAccountsOnNetwork
}
