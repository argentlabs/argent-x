import { useRouteAccountId } from "../../hooks/useRoute"
import { useWalletAccount } from "../accounts/accounts.state"

/** Hook to return the `WalletAccount` on the current network associated with the `:accountAddress` parameter in the current route */
export const useRouteWalletAccount = () => {
  const accountId = useRouteAccountId()
  return useWalletAccount(accountId)
}
