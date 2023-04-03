import {
  AddOwnerMultisigPayload,
  RemoveOwnerMultisigPayload,
  UpdateMultisigThresholdPayload,
} from "../multisig/multisig.model"
import { PendingMultisig } from "../multisig/types"
import { BaseWalletAccount, MultisigData, WalletAccount } from "../wallet.model"

export type MultisigMessage =
  | {
      type: "NEW_MULTISIG_ACCOUNT"
      data: MultisigData & { networkId: string }
    }
  | {
      type: "NEW_MULTISIG_ACCOUNT_RES"
      data: {
        account: WalletAccount
        accounts: WalletAccount[]
      }
    }
  | { type: "NEW_MULTISIG_ACCOUNT_REJ"; data: { error: string } }
  | {
      type: "NEW_PENDING_MULTISIG"
      data: { networkId: string }
    }
  | { type: "NEW_PENDING_MULTISIG_RES"; data: PendingMultisig }
  | { type: "NEW_PENDING_MULTISIG_REJ"; data: { error: string } }
  | { type: "DEPLOY_MULTISIG"; data: BaseWalletAccount }
  | { type: "DEPLOY_MULTISIG_RES" }
  | { type: "DEPLOY_MULTISIG_REJ" }
  | {
      type: "DEPLOY_MULTISIG_ACTION_SUBMITTED"
      data: { txHash: string; actionHash: string }
    }
  | {
      type: "DEPLOY_MULTISIG_ACTION_FAILED"
      data: { actionHash: string; error?: string }
    }
  | { type: "ADD_MULTISIG_OWNERS"; data: AddOwnerMultisigPayload }
  | {
      type: "ADD_MULTISIG_OWNERS_REJ"
      data: { error: string }
    }
  | {
      type: "ADD_MULTISIG_OWNERS_RES"
    }
  | { type: "UPDATE_MULTISIG_THRESHOLD"; data: UpdateMultisigThresholdPayload }
  | {
      type: "UPDATE_MULTISIG_THRESHOLD_REJ"
      data: { error: string }
    }
  | {
      type: "UPDATE_MULTISIG_THRESHOLD_RES"
    }
  | { type: "REMOVE_MULTISIG_OWNER"; data: RemoveOwnerMultisigPayload }
  | {
      type: "REMOVE_MULTISIG_OWNER_REJ"
      data: { error: string }
    }
  | {
      type: "REMOVE_MULTISIG_OWNER_RES"
    }
