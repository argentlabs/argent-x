import {
  AllowArray,
  Call,
  DeclareContractPayload,
  DeployAccountContractPayload,
  TransactionType,
  UniversalDeployerContractPayload,
} from "starknet"

/**
 * TransactionAction is a union type that represents different types of transactions
 * Each type of transaction has an associated payload that provides the necessary information to execute the transaction.
 * Same as EstimateFeeAction from starknet.js
 */
export type TransactionAction =
  | {
      // INVOKE transaction type with a payload that can be a single call or an array of calls.
      type: TransactionType.INVOKE
      payload: AllowArray<Call>
    }
  | {
      // DECLARE transaction type with a payload containing the contract declaration data.
      type: TransactionType.DECLARE
      payload: DeclareContractPayload
    }
  | {
      // DEPLOY_ACCOUNT transaction type with a payload for deploying an account contract.
      type: TransactionType.DEPLOY_ACCOUNT
      payload: DeployAccountContractPayload
    }
  | {
      // DEPLOY transaction type with a payload for deploying a contract using the universal deployer.
      type: TransactionType.DEPLOY
      payload: UniversalDeployerContractPayload
    }
