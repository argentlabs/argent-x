import { getAccounts } from "../../../shared/account/store"
import { useAppState } from "../../app.state"
import { useSelectedAccountStore } from "./accounts.state"

/** Switches to the first visible account on network, otherwise sets selectedAccount to undefined */

export const autoSelectAccountOnNetwork = async (networkId: string) => {
  useAppState.setState({ switcherNetworkId: networkId })
  const visibleAccountsOnNetwork = await getAccounts((account) => {
    return account.networkId === networkId && !account.hidden
  })
  if (visibleAccountsOnNetwork.length) {
    const selectedAccount = visibleAccountsOnNetwork[0]
    useSelectedAccountStore.setState({ selectedAccount })
    return selectedAccount
  } else {
    useSelectedAccountStore.setState({ selectedAccount: undefined })
  }
}
