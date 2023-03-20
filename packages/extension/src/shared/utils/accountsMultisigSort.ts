import { getIndexForPath } from "../../background/keys/keyDerivation"
import { Account } from "../../ui/features/accounts/Account"
import { PendingMultisig } from "../multisig/store"
import { WalletAccount } from "../wallet.model"
import { baseDerivationPath } from "../wallet.service"

export const sortByDerivationPath = (
  a: PendingMultisig | WalletAccount | Account,
  b: PendingMultisig | WalletAccount | Account,
) => {
  const aIndex = getIndexForPath(a.signer.derivationPath, baseDerivationPath)
  const bIndex = getIndexForPath(b.signer.derivationPath, baseDerivationPath)
  return aIndex - bIndex
}

type AccountType = Account | WalletAccount

export const multisigAndAccountSort = <T extends AccountType>(
  pending: PendingMultisig[],
  full: T[],
): (PendingMultisig | T)[] => {
  const sorted = [...pending, ...full]
  sorted.sort(sortByDerivationPath)
  return sorted
}
