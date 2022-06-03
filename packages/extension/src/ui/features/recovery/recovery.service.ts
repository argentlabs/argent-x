import { some } from "lodash-es"

import { accountsOnNetwork, defaultNetwork } from "../../../shared/networks"
import { hasLatestDerivationPath } from "../../../shared/wallet.service"
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
    const allAccounts = await getAccounts()
    // FIXME: remove this if-statement when mainnet is on Cairo 9
    if (some(allAccounts) && !allAccounts.some(hasLatestDerivationPath)) {
      return routes.migrationDisclaimer()
    }

    const lastSelectedAccount = await getLastSelectedAccount()
    networkId ||= lastSelectedAccount
      ? lastSelectedAccount?.network.id
      : defaultNetwork.id

    const walletAccounts = accountsOnNetwork(await getAccounts(), networkId)

    const selectedAccount = walletAccounts.find(
      ({ address }) => address === lastSelectedAccount?.address,
    )?.address

    const accounts = walletAccounts
      .map(
        ({ address, network, signer }) => new Account(address, network, signer),
      )
      .reduce((acc, account) => ({ ...acc, [account.address]: account }), {})

    setDefaultAccountNames(accounts)
    useAccounts.setState({ accounts, selectedAccount })
    useAppState.setState({ switcherNetworkId: networkId })

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
