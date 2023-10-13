import {
  AddAccountPayload,
  AddOwnerMultisigPayload,
  RemoveOwnerMultisigPayload,
  ReplaceOwnerMultisigPayload,
  UpdateMultisigThresholdPayload,
} from "../../multisig.model"
import { BaseWalletAccount, WalletAccount } from "../../../wallet.model"
import { PendingMultisig } from "../../types"

export interface AddAccountResponse {
  account: WalletAccount
  accounts: WalletAccount[]
}

export interface IMultisigService {
  addAccount(payload: AddAccountPayload): Promise<AddAccountResponse>
  addOwner(payload: AddOwnerMultisigPayload): Promise<void>
  removeOwner(payload: RemoveOwnerMultisigPayload): Promise<void>
  replaceOwner(payload: ReplaceOwnerMultisigPayload): Promise<void>
  addPendingAccount(networkId: string): Promise<PendingMultisig>
  addTransactionSignature(requestId: string): Promise<string>
  deploy(account: BaseWalletAccount): Promise<void>
  updateThreshold(payload: UpdateMultisigThresholdPayload): Promise<void>
}
