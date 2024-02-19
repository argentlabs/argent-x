import { BaseError, BaseErrorPayload } from "./baseError"

export enum TRANSACTION_ERROR_MESSAGE {
  NO_TRANSACTION_HASH = "Transaction hash is not available",
  INVALID_TRANSACTION_HASH_RANGE = "Transaction Hash needs to be > 0",
  SIMULATION_DISABLED = "Transaction simulation is disabled",
  SIMULATION_ERROR = "Transaction simulation failed",
  DEPRECATED_ACCOUNT = "Deprecated account",
  NO_PRE_COMPUTED_FEES = "There was an issue computing fees - please reject this transaction and try again",
}

export type TransactionErrorMessage = keyof typeof TRANSACTION_ERROR_MESSAGE

export class TransactionError extends BaseError<TransactionErrorMessage> {
  constructor(payload: BaseErrorPayload<TransactionErrorMessage>) {
    super(payload, TRANSACTION_ERROR_MESSAGE)
    this.name = "TransactionError"
  }
}
