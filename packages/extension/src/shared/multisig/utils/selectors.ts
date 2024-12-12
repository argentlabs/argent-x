import memoize from "memoizee"
import type { BasePendingMultisig, PendingMultisig } from "../types"

export const pendingMultisigEqual = (
  a: BasePendingMultisig,
  b: BasePendingMultisig,
) => a.networkId === b.networkId && a.publicKey === b.publicKey

export const getPendingMultisigSelector = memoize(
  (base: BasePendingMultisig) => (multisig: PendingMultisig) =>
    pendingMultisigEqual(multisig, base),
  { normalizer: ([base]) => `${base.publicKey}::${base.networkId}` },
)

export const withoutHiddenPendingMultisig = (
  pendingMultisig: PendingMultisig,
) => !pendingMultisig.hidden

export const withHiddenPendingMultisig = memoize(() => true, {
  normalizer: () => "default",
})
