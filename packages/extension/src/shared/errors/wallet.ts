import { BaseError, BaseErrorPayload } from "@argent/x-shared"
export enum WALLET_ERROR_MESSAGES {
  ALREADY_INITIALIZED = "Wallet already initialized",
  NOT_INITIALIZED = "Wallet not initialized",
  INVALID_BACKUP_FILE = "Invalid backup file",
  NO_SESSION_OPEN = "You need an open session",
}

export type WalletValidationErrorMessage = keyof typeof WALLET_ERROR_MESSAGES

export class WalletError extends BaseError<WalletValidationErrorMessage> {
  constructor(payload: BaseErrorPayload<WalletValidationErrorMessage>) {
    super(payload, WALLET_ERROR_MESSAGES)
    this.name = "WalletError"
  }
}
