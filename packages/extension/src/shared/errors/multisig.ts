import { BaseError, BaseErrorPayload } from "@argent/x-shared"

export enum MULTISIG_ERROR_MESSAGE {
  PENDING_MULTISIG_TRANSACTION_NOT_FOUND = "Pending Multisig transaction not found",
  PENDING_MULTISIG_OFFCHAIN_SIGNATURE_NOT_FOUND = "Pending Multisig offchain signature not found",
  NO_MULTISIG_BASE_URL = "No multisig base url provided",
  MULTISIG_ACCOUNT_NOT_FOUND = "Multisig account not found",
  SIGNATURE_REQUEST_CANCELLED = "Multisig offchain signature request cancelled",
  INVALID_SIGNER = "Invalid signer",
}

export type MultisigErrorMessage = keyof typeof MULTISIG_ERROR_MESSAGE

export class MultisigError extends BaseError<MultisigErrorMessage> {
  constructor(payload: BaseErrorPayload<MultisigErrorMessage>) {
    super(payload, MULTISIG_ERROR_MESSAGE)
    this.name = "MultisigError"
  }
}
