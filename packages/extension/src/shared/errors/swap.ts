import type { BaseErrorPayload } from "@argent/x-shared"
import { BaseError } from "@argent/x-shared"

export enum SWAP_ERROR_MESSAGE {
  NO_SWAP_URL = "Swap base url not provided",
  INVALID_QUOTE_RESPONSE = "Invalid quote response",
  NO_NETWORK_FOR_SWAP = "Network for swap not found",
  INVALID_SWAP_TOKENS = "Invalid swap tokens",
  INVALID_SWAP_ORDER_RESPONSE = "Invalid swap order response",
}

export type SwapErrorMessage = keyof typeof SWAP_ERROR_MESSAGE

export class SwapError extends BaseError<SwapErrorMessage> {
  constructor(payload: BaseErrorPayload<SwapErrorMessage>) {
    super(payload, SWAP_ERROR_MESSAGE)
    this.name = "SwapError"
  }
}
