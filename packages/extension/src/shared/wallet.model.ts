import type { Network } from "./networks"

export interface WalletAccountSigner {
  type: string
  derivationPath: string
}

export interface WithSigner {
  signer: WalletAccountSigner
}

export interface UniqueAccount {
  address: string
  networkId: string
}

export interface WalletAccount extends UniqueAccount, WithSigner {
  network: Network
  hidden?: boolean
}

export const accountsEqual = (a: UniqueAccount, b: UniqueAccount) =>
  a.address === b.address && a.networkId === b.networkId
