import { ArrayStorage } from "../storage"
import { BaseMultisigWalletAccount } from "../wallet.model"
import { accountsEqual } from "../wallet.service"
import { BasePendingMultisig, PendingMultisig } from "./types"

export const multisigBaseWalletStore =
  new ArrayStorage<BaseMultisigWalletAccount>([], {
    namespace: "core:multisig:baseWallet",
    compare: accountsEqual,
  })

export const pendingMultisigEqual = (
  a: BasePendingMultisig,
  b: BasePendingMultisig,
) => a.networkId === b.networkId && a.publicKey === b.publicKey

export const pendingMultisigStore = new ArrayStorage<PendingMultisig>([], {
  namespace: "core:multisig:pending",
  compare: pendingMultisigEqual,
})
