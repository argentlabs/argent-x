import { networkWallets } from "../../shared/networks"
import { routes } from "../routes"
import { useGlobalState } from "../states/global"
import { Wallet } from "../Wallet"
import { getActions, getLastSelectedWallet, getWallets } from "./messaging"

const recoverNetwork = async () => {
  const { network } = await getLastSelectedWallet()
  if (!network) throw Error("No network stored")
  return network
}

interface RecoveryOptions {
  networkId?: string
  showAccountList?: boolean
}

export const recover = async ({
  networkId,
  showAccountList,
}: RecoveryOptions = {}) => {
  try {
    networkId ||= await recoverNetwork()

    const lastSelectedWallet = await getLastSelectedWallet().catch(() => null)

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
      networkId,
      actions,
      uploadedBackup: undefined,
    })

    if (showAccountList || !selectedWallet) {
      return routes.accounts
    }
    return routes.account
  } catch (e: any) {
    console.error(e)
    useGlobalState.setState({ error: `${e}` })
    // TODO: handle this
  }
}
