import { ArrayStorage } from "../storage"
import { BaseMultisigWalletAccount, WalletAccountSigner } from "../wallet.model"
import { accountsEqual } from "../wallet.service"

export const multisigBaseWalletStore =
  new ArrayStorage<BaseMultisigWalletAccount>([], {
    namespace: "core:multisig:baseWallet",
    compare: accountsEqual,
  })

export interface PendingMultisig {
  networkId: string
  publicKey: string
  signer: WalletAccountSigner
  name: string
  type: "multisig"
}

export const pendingMultisigEqual = (a: PendingMultisig, b: PendingMultisig) =>
  a.networkId === b.networkId && a.publicKey === b.publicKey

export const pendingMultisigStore = new ArrayStorage<PendingMultisig>([], {
  namespace: "core:multisig:pending",
  compare: pendingMultisigEqual,
})
