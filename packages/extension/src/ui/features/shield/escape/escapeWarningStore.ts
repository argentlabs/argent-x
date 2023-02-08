import { ArrayStorage } from "../../../../shared/storage"
import { getAccountIdentifier } from "../../../../shared/wallet.service"
import { Account } from "../../accounts/Account"

export const getEscapeWarningStoreKey = (account: Account) => {
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
