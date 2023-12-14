import { withHiddenSelector } from "../../../shared/account/selectors"
import { accountService } from "../../../shared/account/service"
import { defaultNetwork } from "../../../shared/network"
import { networkService } from "../../../shared/network/service"
import { accountsEqual } from "../../../shared/utils/accountsEqual"
import { walletStore } from "../../../shared/wallet/walletStore"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { accountsOnNetwork } from "../../services/backgroundAccounts"
import { setDefaultAccountNames } from "../accounts/accountMetadata.state"
import {
  mapWalletAccountsToAccounts,
  migrateAccountNetworks,
} from "../accounts/accounts.state"
import { useRestorationState } from "../stateRestoration/restoration.state"
import { clientAccountService } from "../../services/account"

interface RecoveryOptions {
  networkId?: string
  showAccountList?: boolean
  showHiddenAccountList?: boolean
}

export const recover = async ({
  networkId,
  showAccountList,
  showHiddenAccountList,
}: RecoveryOptions = {}) => {
  try {
    const { selected: lastSelectedAccount } = await walletStore.get()

    /** validate that network exists (may have been a custom that was deleted), or use default */
    const network = await networkService.getById(
      lastSelectedAccount?.networkId || networkId || defaultNetwork.id,
    )
    networkId = network.id

    let allWalletAccounts = await accountService.get(withHiddenSelector)
    allWalletAccounts = await migrateAccountNetworks(allWalletAccounts)

    const walletAccounts = accountsOnNetwork(allWalletAccounts, networkId)

    const selectedWalletAccount = walletAccounts.find(
      (account) =>
        lastSelectedAccount && accountsEqual(account, lastSelectedAccount),
    )

    const firstUnhiddenAccount = walletAccounts.find((wa) => !wa.hidden)

    // If no selected account or the selected account is hidden, select the first unhidden account
    const selectedAccount =
      !selectedWalletAccount || selectedWalletAccount.hidden
        ? firstUnhiddenAccount
        : selectedWalletAccount

    const allAccounts = mapWalletAccountsToAccounts(allWalletAccounts)
    const allAccountsHasNames = allAccounts.every((account) => account.name)

    // FIXME: Remove this when migration is done
    if (!allAccountsHasNames) {
      setDefaultAccountNames(allAccounts)
    }
    if (selectedAccount) {
      await clientAccountService.select(selectedAccount)
    }
    useAppState.setState({ switcherNetworkId: networkId })

    if (showAccountList || !selectedAccount) {
      return routes.accounts()
    }

    if (showHiddenAccountList && networkId) {
      return routes.accountsHidden(networkId)
    }

    // restore entryRoute from restoration.state
    const { entryRoute } = useRestorationState.getState()
    if (entryRoute) {
      const { pathname, search } = entryRoute
      return [pathname, search].filter(Boolean).join("")
    }

    return routes.accountTokens()
  } catch (e: any) {
    console.error("Recovery error:", e)
    useAppState.setState({ error: `${e}` })
    return routes.error()
  }
}
