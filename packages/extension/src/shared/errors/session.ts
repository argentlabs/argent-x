import { BaseError, BaseErrorPayload } from "@argent/x-shared"

export enum SESSION_ERROR_MESSAGES {
  NO_OPEN_SESSION = "There is no open session",
  PASSWORD_CHECK_FAILED = "Password check failed",
  START_SESSION_FAILED = "Could not start session",
  START_SESSION_FAILED_BUGGY = "Failed to start session with buggy bytesToUtf8. Trying the correct one.",
  NO_BACKUP_FOUND = "Backup is not found",
}

export type SessionValidationErrorMessage = keyof typeof SESSION_ERROR_MESSAGES

export class SessionError extends BaseError<SessionValidationErrorMessage> {
  constructor(payload: BaseErrorPayload<SessionValidationErrorMessage>) {
    super(payload, SESSION_ERROR_MESSAGES)
    this.name = "SessionError"
  }
}
