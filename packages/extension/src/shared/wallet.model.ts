import { Escape } from "./account/details/getEscape"
import { Network } from "./network"

export type ArgentAccountType =
  | "standard"
  | "plugin"
  | "multisig"
  | "betterMulticall"

export type CreateAccountType = Exclude<
  ArgentAccountType,
  "plugin" | "betterMulticall"
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

export type MultisigData = {
  signers: string[]
  threshold: number
  multisigAddress?: string
  creator?: string
}

export type BaseMultisigWalletAccount = BaseWalletAccount & MultisigData

export interface MultisigWalletAccount extends WalletAccount, MultisigData {
  type: "multisig"
}
