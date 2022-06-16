import type { Network } from "./networks"

export interface WalletAccountSigner {
  type: string
  derivationPath: string
}

export interface WithSigner {
  signer: WalletAccountSigner
}

export interface BaseWalletAccount {
  address: string
  network: {
    id: string
  }
}

export interface WalletAccount extends BaseWalletAccount, WithSigner {
  address: string
  network: Network
  hidden?: boolean
}
