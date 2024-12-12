import type {
  AddAccountPayload,
  AddOwnerMultisigPayload,
  MultisigSignerSignatures,
  RemoveOwnerMultisigPayload,
  ReplaceOwnerMultisigPayload,
  UpdateMultisigThresholdPayload,
} from "../../multisig.model"
import type {
  BaseWalletAccount,
  SignerType,
  WalletAccount,
} from "../../../wallet.model"
import type { PendingMultisig } from "../../types"

export interface AddAccountResponse {
  account: WalletAccount
  accounts: WalletAccount[]
}

export interface IMultisigService {
  addAccount(payload: AddAccountPayload): Promise<AddAccountResponse>
  addOwner(payload: AddOwnerMultisigPayload): Promise<void>
  removeOwner(payload: RemoveOwnerMultisigPayload): Promise<void>
  replaceOwner(payload: ReplaceOwnerMultisigPayload): Promise<void>
  addPendingAccount(
    networkId: string,
    signerType: SignerType,
  ): Promise<PendingMultisig>
  addTransactionSignature(requestId: string, pubKey?: string): Promise<string>
  addOffchainSignature(requestId: string): Promise<MultisigSignerSignatures>
  cancelOffchainSignature(requestId: string): Promise<void>
  deploy(account: BaseWalletAccount): Promise<void>
  updateThreshold(payload: UpdateMultisigThresholdPayload): Promise<void>
  rejectOnChainTransaction(requestId: string): Promise<void>
  retryTransactionExecution(requestId: string): Promise<{ hash: string }>
}
