import type { BaseErrorPayload } from "@argent/x-shared"
import { BaseError } from "@argent/x-shared"

export enum WalletRPCErrorCodes {
  UserAborted = 113,
  Unknown = 163,
}

const WALLET_API_ERRORS = {
  [WalletRPCErrorCodes.UserAborted]: "An error occurred (USER_REFUSED_OP)",
  [WalletRPCErrorCodes.Unknown]: "An error occurred (UNKNOWN_ERROR)",
}

type WalletRPCErrorMessage = keyof typeof WALLET_API_ERRORS

export class WalletRPCError extends BaseError<WalletRPCErrorMessage> {
  constructor(payload: BaseErrorPayload<WalletRPCErrorMessage>) {
    super(payload, WALLET_API_ERRORS)
    this.name = "WalletRPCError"
  }
}
