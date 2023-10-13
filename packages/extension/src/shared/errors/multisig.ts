import { BaseError, BaseErrorPayload } from "./baseError"

export enum MULTISIG_ERROR_MESSAGE {
  PENDING_MULTISIG_TRANSACTION_NOT_FOUND = "Pending Multisig transaction not found",
  NO_MULTISIG_BASE_URL = "No multisig base url provided",
}

export type MultisigErrorMessage = keyof typeof MULTISIG_ERROR_MESSAGE

export class MultisigError extends BaseError<MultisigErrorMessage> {
  constructor(payload: BaseErrorPayload<MultisigErrorMessage>) {
    super(payload, MULTISIG_ERROR_MESSAGE)
    this.name = "MultisigError"
  }
}
