import { LedgerError } from "@ledgerhq/hw-app-starknet"
import type { BaseErrorPayload } from "@argent/x-shared"
import { BaseError } from "@argent/x-shared"
import { isNumber, isString } from "lodash-es"

// Taken from ledger clientjs
export enum AX_LEDGER_ERROR_MESSAGES {
  NO_ERROR = "No error",
  EXECUTION_ERROR = "Execution Error",
  USER_REJECTED = "User rejected",
  BAD_CLA = "Bad cla",
  BAD_INS = "Bad ins",
  INVALID_P1P2 = "Invalid P1/P2",

  // Custom errors
  NO_DEVICE_FOUND = "No device found",
  APP_DOES_NOT_SEEM_TO_BE_OPEN = "App does not seem to be open",
  TRANSPORT_OPEN_ERROR = "Transport open error",
  PUBKEY_GENERATION_ERROR = "Public keys generation error",
  UNKNOWN_ERROR = "Unknown error",
  UNSUPPORTED_ACCOUNT_TYPE = "Unsupported account type",
  UNSUPPORTED_APP_VERSION = "To transact, you must update the starknet app on ledger to the latest version",
}

const STATUS_CODE_TO_AX_LEDGER_ERROR_MESSAGE = {
  [LedgerError.NoError]: "NO_ERROR",
  [LedgerError.ExecutionError]: "EXECUTION_ERROR",
  [LedgerError.UserRejected]: "USER_REJECTED",
  [LedgerError.BadCla]: "BAD_CLA",
  [LedgerError.BadIns]: "BAD_INS",
  [LedgerError.InvalidP1P2]: "INVALID_P1P2",
}

export type AxLedgerErrorMessage = keyof typeof AX_LEDGER_ERROR_MESSAGES

type AxLedgerErrorPayload =
  | BaseErrorPayload<AxLedgerErrorMessage>
  | {
      code: LedgerError
    }

export class AxLedgerError extends BaseError<AxLedgerErrorMessage> {
  constructor(payload: AxLedgerErrorPayload) {
    let errorPayload: BaseErrorPayload<AxLedgerErrorMessage>
    if (isNumber(payload.code)) {
      const errorMessageKey =
        STATUS_CODE_TO_AX_LEDGER_ERROR_MESSAGE[payload.code]
      errorPayload = isString(errorMessageKey)
        ? { code: errorMessageKey as AxLedgerErrorMessage }
        : { code: "UNKNOWN_ERROR" }
    } else {
      errorPayload = payload as BaseErrorPayload<AxLedgerErrorMessage>
    }

    super(errorPayload, AX_LEDGER_ERROR_MESSAGES)
    this.name = "LedgerError"
  }
}
