import type { Network } from "./networks"

export interface WalletAccountSigner {
  type: "local_secret"
  derivationPath: string
}

export interface WithSigner {
  signer: WalletAccountSigner
}

export interface BaseWalletAccount {
  address: string
  networkId: string
}

export interface WalletAccount extends BaseWalletAccount, WithSigner {
  network: Network
  hidden?: boolean
}

export const accountsEqual = (a: BaseWalletAccount, b: BaseWalletAccount) =>
  a.address === b.address && a.networkId === b.networkId
