import { BaseError, BaseErrorPayload } from "@argent/x-shared"

export enum ACCOUNT_MESSAGING_ERROR_MESSAGES {
  ESCAPE_CANCELLATION_FAILED = "Escape cancellation failed",
  CHANGE_GUARDIAN_FAILED = "Change guardian failed",
  ESCAPE_AND_CHANGE_GUARDIAN_FAILED = "Escape and change guardian failed",
  GET_ENCRYPTED_KEY_FAILED = "Get encrypted key failed",
  GET_SEEDPHRASE_FAILED = "Get seedphrase failed",
  GET_NEXT_PUBLIC_KEY_FAILED = "Get next public key failed",
  GET_PUBLIC_KEY_FAILED = "Get public key failed",
  TRIGGER_ESCAPE_FAILED = "Trigger escape failed",
  ACCOUNT_DEPLOYMENT_PAYLOAD_FAILED = "Account deployment payload failed",
}
export type AccountMessagingErrorMessage =
  keyof typeof ACCOUNT_MESSAGING_ERROR_MESSAGES

export class AccountMessagingError extends BaseError<AccountMessagingErrorMessage> {
  constructor(payload: BaseErrorPayload<AccountMessagingErrorMessage>) {
    super(payload, ACCOUNT_MESSAGING_ERROR_MESSAGES)
    this.name = "AccountMessagingError"
  }
}
