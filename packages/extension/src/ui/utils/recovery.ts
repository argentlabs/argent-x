import {
  defaultNetwork,
  localNetworkId,
  networkWallets,
} from "../../shared/networks"
import { routes } from "../routes"
import { useGlobalState } from "../states/global"
import { Wallet } from "../Wallet"
import { getActions, getLastSelectedWallet, getWallets } from "./messaging"

interface RecoveryOptions {
  networkId?: string
  showAccountList?: boolean
}

export const recover = async ({
  networkId,
  showAccountList,
}: RecoveryOptions = {}) => {
  try {
    const lastSelectedWallet = await getLastSelectedWallet().catch(() => null)
    networkId ||= lastSelectedWallet
      ? localNetworkId(lastSelectedWallet?.network)
      : defaultNetwork.id

    const backupWallets = networkWallets(await getWallets(), networkId)

    const selectedWallet = backupWallets.find(
      ({ address }) => address === lastSelectedWallet?.address,
    )?.address

    const wallets = backupWallets
      .map(({ address, network }) => new Wallet(address, network))
      .reduce((acc, wallet) => ({ ...acc, [wallet.address]: wallet }), {})

    // if actions are pending show them first
    const actions = await getActions().catch(() => [])

    useGlobalState.setState({
      wallets,
      selectedWallet,
      switcherNetworkId: networkId,
      actions,
      uploadedBackup: undefined,
    })

    if (showAccountList || !selectedWallet) {
      return routes.accounts
    }
    return routes.account
  } catch (e: any) {
    console.error("Recovery error:", e)
    useGlobalState.setState({ error: `${e}` })
    return routes.error
  }
}
