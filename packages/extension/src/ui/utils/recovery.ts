import {
  defaultNetwork,
  localNetworkId,
  networkWallets,
} from "../../shared/networks"
import { Account } from "../Account"
import { routes } from "../routes"
import { useAccount } from "../states/account"
import { setDefaultAccountNames } from "../states/accountMetadata"
import { useAppState } from "../states/app"
import { getLastSelectedWallet, getWallets } from "./messaging"

interface RecoveryOptions {
  networkId?: string
  showAccountList?: boolean
}

export const recover = async ({
  networkId,
  showAccountList,
}: RecoveryOptions = {}) => {
  try {
    const lastSelectedAccount = await getLastSelectedWallet().catch(() => null)
    networkId ||= lastSelectedAccount
      ? localNetworkId(lastSelectedAccount?.network)
      : defaultNetwork.id

    const backupWallets = networkWallets(await getWallets(), networkId)

    const selectedAccount = backupWallets.find(
      ({ address }) => address === lastSelectedAccount?.address,
    )?.address

    const accounts = backupWallets
      .map(({ address, network }) => new Account(address, network))
      .reduce((acc, account) => ({ ...acc, [account.address]: account }), {})

    setDefaultAccountNames(accounts)
    useAccount.setState({ accounts, selectedAccount })
    useAppState.setState({ switcherNetworkId: networkId })

    if (showAccountList || !selectedAccount) {
      return routes.accounts()
    }
    return routes.account()
  } catch (e: any) {
    console.error("Recovery error:", e)
    useAppState.setState({ error: `${e}` })
    return routes.error()
  }
}
