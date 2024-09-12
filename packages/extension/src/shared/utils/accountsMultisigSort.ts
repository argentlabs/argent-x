import { getIndexForPath } from "./derivationPath"
import { PendingMultisig } from "../multisig/types"
import { SignerType } from "../wallet.model"
import { getBaseDerivationPath } from "../signer/utils"

interface SortableAccount {
  signer: {
    type: SignerType
    derivationPath: string
  }
}

const signerPriority: { [key in SignerType]: number } = {
  [SignerType.LOCAL_SECRET]: 0,
  [SignerType.LEDGER]: 1,
}

export const sortAccountsByDerivationPath = (
  a: SortableAccount,
  b: SortableAccount,
) => {
  const aIndex = getIndexForPath(
    a.signer.derivationPath,
    getBaseDerivationPath("standard", a.signer.type),
  )
  const bIndex = getIndexForPath(
    b.signer.derivationPath,
    getBaseDerivationPath("standard", b.signer.type),
  )

  return aIndex - bIndex
}

export const sortAccountsBySignerPriority = (
  a: SortableAccount,
  b: SortableAccount,
) => {
  return signerPriority[a.signer.type] - signerPriority[b.signer.type]
}

export const sortMultisigByDerivationPath = (
  a: SortableAccount,
  b: SortableAccount,
) => {
  const aIndex = getIndexForPath(
    a.signer.derivationPath,
    getBaseDerivationPath("multisig", a.signer.type),
  )
  const bIndex = getIndexForPath(
    b.signer.derivationPath,
    getBaseDerivationPath("multisig", b.signer.type),
  )
  return aIndex - bIndex
}

// Sorts accounts by derivation path and then by signer priority
export const sortStandardAccounts = <T extends SortableAccount>(
  accounts: T[],
): T[] => {
  return [...accounts]
    .sort(sortAccountsByDerivationPath)
    .sort(sortAccountsBySignerPriority)
}

export const sortMultisigAccounts = <T extends SortableAccount>(
  multisigAccounts: T[],
): T[] => {
  return [...multisigAccounts].sort(sortMultisigByDerivationPath)
}

export const sortMultisigAndPendingMultisigAccounts = <
  T extends SortableAccount,
>(
  pending: PendingMultisig[],
  full: T[],
): (PendingMultisig | T)[] => {
  return [...pending, ...full]
    .sort(sortMultisigByDerivationPath)
    .sort(sortAccountsBySignerPriority)
}
