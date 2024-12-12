import { ArrayStorage } from "../../../../shared/storage"
import type { WalletAccount } from "../../../../shared/wallet.model"

export const getEscapeWarningStoreKey = (account: WalletAccount) => {
  if (!account.escape) {
    return account.id
  }
  const { activeAt, type } = account.escape
  return `${account.id}::${activeAt}::${type}`
}

/** keep a record of all the account escapes we notified the user about */

export const escapeWarningStore = new ArrayStorage<string>([], {
  namespace: `service:escapeWarning`,
})
