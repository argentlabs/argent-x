import type { IRepository } from "../storage/__new/interface"
import type {
  BaseMultisigWalletAccount,
  WalletAccountSigner,
} from "../wallet.model"

export const enum MultisigEntryPointType {
  // read
  GET_SIGNERS = "get_signers",
  GET_THRESHOLD = "get_threshold",

  // write
  ADD_SIGNERS = "add_signers",
  CHANGE_THRESHOLD = "change_threshold",
  REMOVE_SIGNERS = "remove_signers",
  REPLACE_SIGNER = "replace_signer",
  UPGRADE = "upgrade",
}

export const enum MultisigTransactionType {
  MULTISIG_ADD_SIGNERS = "MULTISIG_ADD_SIGNERS",
  MULTISIG_CHANGE_THRESHOLD = "MULTISIG_CHANGE_THRESHOLD",
  MULTISIG_REMOVE_SIGNERS = "MULTISIG_REMOVE_SIGNERS",
  MULTISIG_REPLACE_SIGNER = "MULTISIG_REPLACE_SIGNER",
  MULTISIG_REJECT_ON_CHAIN = "MULTISIG_REJECT_ON_CHAIN",
}

export interface BasePendingMultisig {
  networkId: string
  publicKey: string
}
export interface PendingMultisig extends BasePendingMultisig {
  signer: WalletAccountSigner
  name: string
  type: "multisig"
  hidden?: boolean
}

export interface SignerMetadata {
  key: string
  name: string
}
export interface MultisigMetadata {
  multisigPublicKey: string
  signers: SignerMetadata[]
}

export type IPendingMultisigsRepositary = IRepository<PendingMultisig>

export type MultisigBaseWalletRepositary =
  IRepository<BaseMultisigWalletAccount>

export type IMultisigBaseWalletRepositary =
  IRepository<BaseMultisigWalletAccount>
