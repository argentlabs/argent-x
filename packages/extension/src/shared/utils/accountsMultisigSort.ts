import { getIndexForPath } from "../../background/keys/keyDerivation"
import { Account } from "../../ui/features/accounts/Account"
import { PendingMultisig } from "../multisig/types"
import { WalletAccount } from "../wallet.model"
import {
  STANDARD_DERIVATION_PATH,
  MULTISIG_DERIVATION_PATH,
} from "../wallet.service"

export const sortAccountsByDerivationPath = (
  a: WalletAccount | Account,
  b: WalletAccount | Account,
) => {
  const aIndex = getIndexForPath(
    a.signer.derivationPath,
    STANDARD_DERIVATION_PATH,
  )
  const bIndex = getIndexForPath(
    b.signer.derivationPath,
    STANDARD_DERIVATION_PATH,
  )
  return aIndex - bIndex
}

export const sortMultisigByDerivationPath = (
  a: PendingMultisig | WalletAccount | Account,
  b: PendingMultisig | WalletAccount | Account,
) => {
  const aIndex = getIndexForPath(
    a.signer.derivationPath,
    MULTISIG_DERIVATION_PATH,
  )
  const bIndex = getIndexForPath(
    b.signer.derivationPath,
    MULTISIG_DERIVATION_PATH,
  )
  return aIndex - bIndex
}

type AccountType = Account | WalletAccount

export const accountSort = <T extends AccountType>(accounts: T[]): T[] => {
  const sorted = [...accounts]
  sorted.sort(sortAccountsByDerivationPath)
  return sorted
}

export const multisigAndPendingMultisigSort = <T extends AccountType>(
  pending: PendingMultisig[],
  full: T[],
): (PendingMultisig | T)[] => {
  const sorted = [...pending, ...full]
  sorted.sort(sortMultisigByDerivationPath)
  return sorted
}
