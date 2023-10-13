import { memoize } from "lodash-es"

import { BasePendingMultisig, PendingMultisig } from "../types"

export const pendingMultisigEqual = (
  a: BasePendingMultisig,
  b: BasePendingMultisig,
) => a.networkId === b.networkId && a.publicKey === b.publicKey

export const getPendingMultisigSelector = memoize(
  (base: BasePendingMultisig) => (multisig: PendingMultisig) =>
    pendingMultisigEqual(multisig, base),
)

export const withoutHiddenPendingMultisig = (
  pendingMultisig: PendingMultisig,
) => !pendingMultisig.hidden

export const withHiddenPendingMultisig = memoize(
  () => true,
  () => "default",
)
