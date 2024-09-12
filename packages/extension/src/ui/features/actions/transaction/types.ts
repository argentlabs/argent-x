import { Call } from "starknet"

import { ArgentAccountType } from "../../../../shared/wallet.model"

export enum ApproveScreenType {
  TRANSACTION,
  DECLARE,
  DEPLOY,
  ACCOUNT_DEPLOY,
  MULTISIG_DEPLOY,
  MULTISIG_ADD_SIGNERS,
  MULTISIG_UPDATE_THRESHOLD,
  MULTISIG_REMOVE_SIGNERS,
  MULTISIG_REPLACE_SIGNER,
  MULTISIG_ON_CHAIN_REJECT,
  ADD_GUARDIAN,
  REMOVE_GUARDIAN,
}

export type TransactionActionsType =
  | {
      type: "INVOKE_FUNCTION"
      payload: Call[]
    }
  | {
      type: "DEPLOY_ACCOUNT"
      payload: {
        accountAddress: string
        classHash?: string
        type: ArgentAccountType
      }
    }
  | {
      type: "ADD_GUARDIAN"
      payload: {
        accountAddress: string
      }
    }
  | {
      type: "REMOVE_GUARDIAN"
      payload: {
        accountAddress: string
      }
    }
