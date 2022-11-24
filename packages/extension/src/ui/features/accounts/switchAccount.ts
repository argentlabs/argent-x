import { getAccounts } from "../../../shared/account/store"
import { isEqualWalletAddress } from "../../../shared/wallet.service"
import { walletStore } from "../../../shared/wallet/walletStore"
import { useAppState } from "../../app.state"
import { selectAccount } from "../../services/backgroundAccounts"
import { setDefaultAccountNames } from "./accountMetadata.state"
import { mapWalletAccountsToAccounts } from "./accounts.state"

/** Switches to the first visible account on network, otherwise sets selectedAccount to undefined */

export const autoSelectAccountOnNetwork = async (networkId: string) => {
  console.log(
    "🚀 ~ file: switchAccount.ts ~ line 12 ~ autoSelectAccountOnNetwork ~ networkId",
    networkId,
  )
  const { switcherNetworkId } = useAppState.getState()
  console.log(
    "🚀 ~ file: switchAccount.ts ~ line 13 ~ autoSelectAccountOnNetwork ~ switcherNetworkId",
    switcherNetworkId,
  )
  const selectedAccount = await walletStore.get("selected")

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
  console.log(
    "🚀 ~ file: switchAccount.ts ~ line 28 ~ visibleAccountsOnNetwork ~ visibleAccountsOnNetwork",
    visibleAccountsOnNetwork,
  )

  if (visibleAccountsOnNetwork.length) {
    const existingAccountOnNetwork =
      selectedAccount &&
      visibleAccountsOnNetwork.find((account) =>
        isEqualWalletAddress(account, selectedAccount),
      )

    // if the selected account is not on the network, switch to the first visible account
    const account = existingAccountOnNetwork || visibleAccountsOnNetwork[0]
    console.log(
      "🚀 ~ file: switchAccount.ts ~ line 50 ~ autoSelectAccountOnNetwork ~ account",
      account,
    )
    await selectAccount(account)
    return account
  } else {
    return await selectAccount(undefined)
  }
}
