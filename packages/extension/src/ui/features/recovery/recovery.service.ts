import { some } from "lodash-es"

import { defaultNetwork } from "../../../shared/network"
import { accountsEqual, isDeprecated } from "../../../shared/wallet.service"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import {
  accountsOnNetwork,
  getAccounts,
  getLastSelectedAccount,
  selectAccount,
} from "../../services/backgroundAccounts"
import { setDefaultAccountNames } from "../accounts/accountMetadata.state"
import { mapWalletAccountsToAccounts } from "../accounts/accounts.state"

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
    const lastSelectedAccount = await getLastSelectedAccount()
    networkId ??= lastSelectedAccount?.networkId ?? defaultNetwork.id

    const allAccounts = await getAccounts(true)
    const walletAccounts = accountsOnNetwork(allAccounts, networkId)

    const selectedWalletAccount = walletAccounts.find(
      (account) =>
        lastSelectedAccount && accountsEqual(account, lastSelectedAccount),
    )

    const firstUnhiddenAccount = walletAccounts.find((wa) => !wa.hidden)

    const selectedAccount = !selectedWalletAccount?.hidden
      ? selectedWalletAccount
      : firstUnhiddenAccount

    const accounts = mapWalletAccountsToAccounts(walletAccounts)

    setDefaultAccountNames(accounts)
    await selectAccount(selectedAccount)
    useAppState.setState({ switcherNetworkId: networkId })

    // this needs to be after changing the state, otherwise the migration screen would deploy on the network that was selected before the switch
    // shows deprecation screen depending on selected network
    if (some(walletAccounts) && walletAccounts.every(isDeprecated)) {
      return routes.migrationDisclaimer()
    }

    if (showAccountList || !selectedAccount) {
      return routes.accounts()
    }

    if (showHiddenAccountList && networkId) {
      return routes.accountsHidden(networkId)
    }

    return routes.accountTokens()
  } catch (e: any) {
    console.error("Recovery error:", e)
    useAppState.setState({ error: `${e}` })
    return routes.error()
  }
}
