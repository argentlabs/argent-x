import type { Network } from "./networks"

export interface WalletAccountSigner {
  type: string
  derivationPath: string
}

export interface WithSigner {
  signer: WalletAccountSigner
}

export interface WalletAccount extends WithSigner {
  address: string
  network: Network
}
