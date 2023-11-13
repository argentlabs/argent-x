import { BaseError, BaseErrorPayload } from "./baseErrors"

export enum NETWORK_ERROR_MESSAGES {
  NO_NETWORK_OR_MULTICALL = "Missing networkId or multicall",
  NOT_FOUND = "Network not found",
}

export type NetworkErrorMessage = keyof typeof NETWORK_ERROR_MESSAGES

export class NetworkError extends BaseError<NetworkErrorMessage> {
  constructor(payload: BaseErrorPayload<NetworkErrorMessage>) {
    super(payload, NETWORK_ERROR_MESSAGES)
    this.name = "NetworkError"
  }
}
