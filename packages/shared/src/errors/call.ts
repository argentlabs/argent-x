import { BaseError, BaseErrorPayload } from "./baseErrors"

export enum CALL_ERROR_MESSAGES {
  NOT_VALID = "Invalid call",
}

export type CallErrorMessage = keyof typeof CALL_ERROR_MESSAGES

export class CallError extends BaseError<CallErrorMessage> {
  constructor(payload: BaseErrorPayload<CallErrorMessage>) {
    super(payload, CALL_ERROR_MESSAGES)
    this.name = "CallError"
  }
}
