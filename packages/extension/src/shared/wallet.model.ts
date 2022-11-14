import { Network } from "./network"

export type ArgentAccountType = "argent" | "argent-plugin"
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
  type: ArgentAccountType
  hidden?: boolean
  needsDeploy?: boolean
}

export type StoredWalletAccount = Omit<WalletAccount, "network">
