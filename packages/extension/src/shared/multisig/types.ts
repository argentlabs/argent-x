import { WalletAccountSigner } from "../wallet.model"

export interface BasePendingMultisig {
  networkId: string
  publicKey: string
}
export interface PendingMultisig extends BasePendingMultisig {
  signer: WalletAccountSigner
  name: string
  type: "multisig"
}
