import { Escape } from "./account/details/getEscape"
import { Network } from "./network"

export type ArgentAccountType =
  | "standard"
  | "plugin"
  | "multisig"
  | "betterMulticall"
  | "argent5MinuteEscapeTestingAccount"

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
  creator?: string // Creator is the public key of the account that created the multisig account
}

export type BaseMultisigWalletAccount = BaseWalletAccount & MultisigData

export interface MultisigWalletAccount extends WalletAccount, MultisigData {
  type: "multisig"
}

export type AddOwnerMultisiPayload = {
  address: string
  newThreshold: number
  signersToAdd: string[]
  currentThreshold?: number
}
