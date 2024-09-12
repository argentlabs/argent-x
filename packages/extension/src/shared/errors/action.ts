import { BaseError, BaseErrorPayload } from "@argent/x-shared"

export enum ACTION_ERROR_MESSAGES {
  NOT_FOUND = "Action not found",
}
export type ActionErrorMessage = keyof typeof ACTION_ERROR_MESSAGES

export class ActionError extends BaseError<ActionErrorMessage> {
  constructor(payload: BaseErrorPayload<ActionErrorMessage>) {
    super(payload, ACTION_ERROR_MESSAGES)
    this.name = "ActionErrorMessage"
  }
}
