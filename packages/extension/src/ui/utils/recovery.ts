import {
  defaultNetwork,
  localNetworkId,
  networkWallets,
} from "../../shared/networks"
import { routes } from "../routes"
import { useAccount } from "../states/account"
import { useActions } from "../states/actions"
import { useAppState } from "../states/app"
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

    useAccount.setState({ wallets, selectedWallet })
    useAppState.setState({ switcherNetworkId: networkId })

    if (showAccountList || !selectedWallet) {
      return routes.accounts
    }
    return routes.account
  } catch (e: any) {
    console.error("Recovery error:", e)
    useAppState.setState({ error: `${e}` })
    return routes.error
  }
}
