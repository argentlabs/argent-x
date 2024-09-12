import { withHiddenSelector } from "../../../shared/account/selectors"
import { accountService } from "../../../shared/account/service"
import { defaultNetwork } from "../../../shared/network"
import { accountsEqual } from "../../../shared/utils/accountsEqual"
import { isNetworkOnlyPlaceholderAccount } from "../../../shared/wallet.model"
import { old_walletStore } from "../../../shared/wallet/walletStore"
import { clientAccountService } from "../../services/account"
import { setDefaultAccountNames } from "./accountMetadata.state"
import { mapWalletAccountsToAccounts } from "./accounts.state"
import { getDefaultSortedAccounts } from "./getDefaultSortedAccount"

/** Switches to the first visible account on network, otherwise sets selectedAccount to undefined */

export const autoSelectAccountOnNetwork = async (networkId: string) => {
  const selectedAccount = await old_walletStore.get("selected")
  const selectedNetworkId = selectedAccount?.networkId ?? defaultNetwork.id

  /** switch network and set default account names */
  if (selectedNetworkId !== networkId) {
    const allWalletAccounts = await accountService.get(withHiddenSelector)
    const allAccounts = mapWalletAccountsToAccounts(allWalletAccounts)
    const allAccountsHasNames = allAccounts.every((account) => account.name)
    // FIXME: Remove this when migration is done
    if (!allAccountsHasNames) {
      setDefaultAccountNames(allAccounts)
    }
  }

  const visibleAccountsOnNetwork = await accountService.get((account) => {
    return account.networkId === networkId && !account.hidden
  })

  if (visibleAccountsOnNetwork.length) {
    const existingAccountOnNetwork =
      selectedAccount &&
      !isNetworkOnlyPlaceholderAccount(selectedAccount) &&
      visibleAccountsOnNetwork.find((account) =>
        accountsEqual(account, selectedAccount),
      )

    const lastUsedAccountOnNetwork =
      await clientAccountService.getLastUsedAccountOnNetwork(networkId)

    // if the selected account is not on the network, switch to the first visible account with standard accounts coming first
    const account =
      existingAccountOnNetwork ||
      lastUsedAccountOnNetwork ||
      getDefaultSortedAccounts(visibleAccountsOnNetwork)[0]
    await clientAccountService.select(account)
    return account
  } else {
    await clientAccountService.select({ networkId, address: null })
    return null
  }
}
