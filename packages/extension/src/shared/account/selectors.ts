import memoize from "memoizee"

import type { BaseWalletAccount, StoredWalletAccount } from "../wallet.model"
import { accountsEqual } from "../utils/accountsEqual"

export const getAccountSelector = memoize(
  (baseAccount: BaseWalletAccount) => (account: StoredWalletAccount) =>
    accountsEqual(account, baseAccount),
  { normalizer: ([account]) => account.id },
)

export const getNetworkSelector = memoize(
  (networkId: string) => (account: StoredWalletAccount) =>
    account.networkId === networkId,
  { primitive: true },
)

export const withoutHiddenSelector = (account: StoredWalletAccount) =>
  !account.hidden

export const withHiddenSelector = memoize(() => true, {
  normalizer: () => "default",
})

export const withGuardianSelector = (account: StoredWalletAccount) =>
  Boolean(account.guardian)
