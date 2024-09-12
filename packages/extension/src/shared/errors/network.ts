import { BaseError, BaseErrorPayload } from "@argent/x-shared"

export enum NETWORK_ERROR_MESSAGES {
  NOT_FOUND = "Network not found",
  NETWORK_STATUS_RESPONSE_PARSING_FAILED = "Failed to parse checkly response",
  NETWORK_STATUS_REQUEST_FAILED = "Failed to request network status",
  ARGENT_NETWORK_STATUS_NOT_DEFINED = "ARGENT_NETWORK_STATUS is not defined",
}

export type NetworkValidationErrorMessage = keyof typeof NETWORK_ERROR_MESSAGES

export class NetworkError extends BaseError<NetworkValidationErrorMessage> {
  constructor(payload: BaseErrorPayload<NetworkValidationErrorMessage>) {
    super(payload, NETWORK_ERROR_MESSAGES)
    this.name = "NetworkError"
  }
}
