import { Escape } from "./account/details/getEscape"
import { Network } from "./network"

export type ArgentAccountType =
  | "standard"
  | "plugin"
  | "multisig"
  | "multicall2"

export type CreateAccountType = Exclude<
  ArgentAccountType,
  "plugin" | "multicall2"
> // Should not be able to create plugin accounts
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
  guardian?: string
  escape?: Escape
}

export type StoredWalletAccount = Omit<WalletAccount, "network">

export type MultisigPayload = {
  signers: string[]
  threshold: string
}
