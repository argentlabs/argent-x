import { withHiddenSelector } from "../account/selectors"
import { accountService } from "../account/service"
import { defaultNetwork } from "../network"
import { networkService } from "../network/service"
import { accountsEqual } from "../utils/accountsEqual"
import { isNetworkOnlyPlaceholderAccount } from "../wallet.model"
import { getDefaultSortedAccounts } from "./getDefaultSortedAccount"
import { walletStore } from "./walletStore"

export const sanitiseSelectedAccount = async () => {
  const { selected: lastSelectedAccount, backup } = await walletStore.get()
  if (!backup) {
    return
  }

  /** validate that network exists (may have been a custom that was deleted), or use default */
  const network = await networkService.getById(
    lastSelectedAccount?.networkId || defaultNetwork.id,
  )
  const networkId = network.id

  const allWalletAccounts = await accountService.get(withHiddenSelector)

  const walletAccounts = allWalletAccounts.filter(
    (account) => account.networkId === networkId,
  )

  const selectedWalletAccount = walletAccounts.find(
    (account) =>
      lastSelectedAccount &&
      !isNetworkOnlyPlaceholderAccount(lastSelectedAccount) &&
      accountsEqual(account, lastSelectedAccount),
  )

  const firstUnhiddenAccount = getDefaultSortedAccounts(walletAccounts).find(
    (wa) => !wa.hidden,
  )

  // If no selected account or the selected account is hidden, select the first unhidden account
  const selectedAccount = isNetworkOnlyPlaceholderAccount(lastSelectedAccount)
    ? lastSelectedAccount
    : !selectedWalletAccount || selectedWalletAccount.hidden
      ? firstUnhiddenAccount
      : selectedWalletAccount

  if (selectedAccount) {
    await walletStore.set({ selected: selectedAccount })
  }
}
