import { BaseError, BaseErrorPayload } from "@argent/x-shared"

export enum PUB_KEY_ERROR_MESSAGES {
  FAILED_NEXT_PUB_KEY_GENERATION = "Failed to generate next PubKey",
  FAILED_BUFFER_GENERATION = "Failed to generate PubKey buffer",
}

export type PubKeyErrorMessage = keyof typeof PUB_KEY_ERROR_MESSAGES

export class PubKeyError extends BaseError<PubKeyErrorMessage> {
  constructor(payload: BaseErrorPayload<PubKeyErrorMessage>) {
    super(payload, PUB_KEY_ERROR_MESSAGES)
    this.name = "PubKeyError"
  }
}
