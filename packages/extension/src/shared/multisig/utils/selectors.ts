import { memoize } from "lodash-es"

import { pendingMultisigEqual } from "../store"
import { BasePendingMultisig, PendingMultisig } from "../types"

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
