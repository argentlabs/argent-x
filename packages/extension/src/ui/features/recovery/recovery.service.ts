import { some } from "lodash-es"

import { accountsOnNetwork, defaultNetwork } from "../../../shared/networks"
import { accountsEqual, isDeprecated } from "../../../shared/wallet.service"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import {
  getAccounts,
  getLastSelectedAccount,
} from "../../services/backgroundAccounts"
import { Account } from "../accounts/Account"
import { setDefaultAccountNames } from "../accounts/accountMetadata.state"
import { useAccounts } from "../accounts/accounts.state"

interface RecoveryOptions {
  networkId?: string
  showAccountList?: boolean
}

export const recover = async ({
  networkId,
  showAccountList,
}: RecoveryOptions = {}) => {
  try {
    const lastSelectedAccount = await getLastSelectedAccount()
    networkId ||= lastSelectedAccount
      ? lastSelectedAccount.network.id
      : defaultNetwork.id

    const allAccounts = await getAccounts()
    const walletAccounts = accountsOnNetwork(allAccounts, networkId)

    const selectedAccount = walletAccounts.find(
      (account) =>
        lastSelectedAccount && accountsEqual(account, lastSelectedAccount),
    )

    const accounts = walletAccounts
      .map(
        ({ address, network, signer }) => new Account(address, network, signer),
      )
      .reduce((acc, account) => ({ ...acc, [account.address]: account }), {})

    setDefaultAccountNames(accounts)
    useAccounts.setState({ accounts, selectedAccount })
    useAppState.setState({ switcherNetworkId: networkId })

    // this needs to be after changing the state, otherwise the migration screen would deploy on the network that was selected before the switch
    // shows deprecation screen depending on selected network
    if (some(walletAccounts) && walletAccounts.every(isDeprecated)) {
      return routes.migrationDisclaimer()
    }

    if (showAccountList || !selectedAccount) {
      return routes.accounts()
    }
    return routes.accountTokens()
  } catch (e: any) {
    console.error("Recovery error:", e)
    useAppState.setState({ error: `${e}` })
    return routes.error()
  }
}
