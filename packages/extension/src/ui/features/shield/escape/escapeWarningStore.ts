import { ArrayStorage } from "../../../../shared/storage"
import { WalletAccount } from "../../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../../shared/wallet.service"

export const getEscapeWarningStoreKey = (account: WalletAccount) => {
  const accountIdentifier = getAccountIdentifier(account)
  if (!account.escape) {
    return accountIdentifier
  }
  const { activeAt, type } = account.escape
  return `${accountIdentifier}::${activeAt}::${type}`
}

/** keep a record of all the account escapes we notified the user about */

export const escapeWarningStore = new ArrayStorage<string>([], {
  namespace: `service:escapeWarning`,
})
