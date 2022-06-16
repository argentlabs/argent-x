import type { Network } from "./networks"

export interface WalletAccountSigner {
  type: string
  derivationPath: string
}

export interface WithSigner {
  signer: WalletAccountSigner
}

export interface UniqAccount {
  address: string
  network: {
    id: string
  }
}

export interface WalletAccount extends UniqAccount, WithSigner {
  address: string
  network: Network
  hidden?: boolean
}
