import { getAccounts } from "../../../shared/account/store"
import { isEqualWalletAddress } from "../../../shared/wallet.service"
import { useAppState } from "../../app.state"
import { setDefaultAccountNames } from "./accountMetadata.state"
import {
  mapWalletAccountsToAccounts,
  useSelectedAccountStore,
} from "./accounts.state"

/** Switches to the first visible account on network, otherwise sets selectedAccount to undefined */

export const autoSelectAccountOnNetwork = async (networkId: string) => {
  const { switcherNetworkId } = useAppState.getState()
  const { selectedAccount } = useSelectedAccountStore.getState()

  /** switch network and set default account names */
  if (switcherNetworkId !== networkId) {
    const allAccountsOnNetwork = await getAccounts((account) => {
      return account.networkId === networkId
    })
    const accounts = mapWalletAccountsToAccounts(allAccountsOnNetwork)
    setDefaultAccountNames(accounts)
    useAppState.setState({ switcherNetworkId: networkId })
  }

  const visibleAccountsOnNetwork = await getAccounts((account) => {
    return account.networkId === networkId && !account.hidden
  })

  if (visibleAccountsOnNetwork.length) {
    const existingAccountOnNetwork = selectedAccount
      ? visibleAccountsOnNetwork.find((account) =>
          isEqualWalletAddress(account, selectedAccount),
        )
      : null

    // if the selected account is not on the network, switch to the first visible account
    useSelectedAccountStore.setState({
      selectedAccount: existingAccountOnNetwork || visibleAccountsOnNetwork[0],
    })
  } else {
    useSelectedAccountStore.setState({ selectedAccount: undefined })
  }
}
