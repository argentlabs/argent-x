import { getIndexForPath } from "./derivationPath"
import { PendingMultisig } from "../multisig/types"
import {
  STANDARD_DERIVATION_PATH,
  MULTISIG_DERIVATION_PATH,
} from "../wallet.service"

interface SortableAccount {
  signer: {
    derivationPath: string
  }
}

export const sortAccountsByDerivationPath = (
  a: SortableAccount,
  b: SortableAccount,
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
  a: SortableAccount,
  b: SortableAccount,
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

export const accountSort = <T extends SortableAccount>(accounts: T[]): T[] => {
  const sorted = [...accounts]
  sorted.sort(sortAccountsByDerivationPath)
  return sorted
}

export const multisigAndPendingMultisigSort = <T extends SortableAccount>(
  pending: PendingMultisig[],
  full: T[],
): (PendingMultisig | T)[] => {
  const sorted = [...pending, ...full]
  sorted.sort(sortMultisigByDerivationPath)
  return sorted
}
