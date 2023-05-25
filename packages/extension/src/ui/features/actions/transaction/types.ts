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
  MULTISIG_REMOVE_SIGNER,
  ADD_ARGENT_SHIELD,
  REMOVE_ARGENT_SHIELD,
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
      type: "ADD_ARGENT_SHIELD"
      payload: {
        accountAddress: string
      }
    }
  | {
      type: "REMOVE_ARGENT_SHIELD"
      payload: {
        accountAddress: string
      }
    }
