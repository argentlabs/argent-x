import { memoize } from "lodash-es"

import { BaseWalletAccount, StoredWalletAccount } from "../wallet.model"
import { accountsEqual } from "../wallet.service"

export const getAccountSelector = memoize(
  (baseAccount: BaseWalletAccount) => (account: StoredWalletAccount) =>
    accountsEqual(account, baseAccount),
)

export const withoutHiddenSelector = (account: StoredWalletAccount) =>
  !account.hidden

export const withHiddenSelector = memoize(
  () => true,
  () => "default",
)
