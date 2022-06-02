import type { Network } from "./networks"

export interface WalletAccountSigner {
  type: string
  derivationPath: string
}

export interface WalletAccount {
  address: string
  network: Network
  signer: WalletAccountSigner
  hidden?: boolean
}
