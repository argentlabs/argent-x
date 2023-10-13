import { BaseError, BaseErrorPayload } from "./baseError"

export enum RECOVERY_ERROR_MESSAGE {
  ARGENT_ACCOUNT_DISCOVERY_URL_NOT_SET = "ARGENT_ACCOUNT_DISCOVERY_URL is not set",
  ARGENT_MULTISIG_DISCOVERY_URL_NOT_SET = "ARGENT_MULTISIG_DISCOVERY_URL is not set",
  ACCOUNT_DISCOVERY_REQUEST_FAILED = "Failed to fetch accounts for discovery",
  MULTISIG_DISCOVERY_REQUEST_FAILED = "Failed to fetch multisigs for discovery",
  ACCOUNT_DETAILS_FETCH_FAILED = "Failed to fetch account details",
  SEED_RECOVERY_INCOMPLETE = "Seed recovery is not complete",
}

export type RecoveryErrorMessage = keyof typeof RECOVERY_ERROR_MESSAGE

export class RecoveryError extends BaseError<RecoveryErrorMessage> {
  constructor(payload: BaseErrorPayload<RecoveryErrorMessage>) {
    super(payload, RECOVERY_ERROR_MESSAGE)
    this.name = "RecoveryError"
  }
}
