import { memoize } from "lodash-es"

import { BaseWalletAccount, StoredWalletAccount } from "../wallet.model"
import { accountsEqual } from "../wallet.service"

export const getAccountSelector = memoize(
  (baseAccount: BaseWalletAccount) => (account: StoredWalletAccount) =>
    accountsEqual(account, baseAccount),
)

export const getNetworkSelector = memoize(
  (networkId: string) => (account: StoredWalletAccount) =>
    account.networkId === networkId,
)

export const withoutHiddenSelector = (account: StoredWalletAccount) =>
  !account.hidden

export const withHiddenSelector = memoize(
  () => true,
  () => "default",
)

export const withGuardianSelector = (account: StoredWalletAccount) =>
  Boolean(account.guardian)
