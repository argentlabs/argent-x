import { JsonArray, JsonObject } from "type-fest"

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray

export interface BaseErrorPayload<T> {
  message?: string
  options?: { error?: unknown; context?: JsonValue }
  code?: T
}

export class BaseError<T extends string> extends Error {
  public readonly context?: JsonValue
  public readonly code?: T

  constructor(
    { code, message, options = {} }: BaseErrorPayload<T>,
    private errorMessages?: { [key in T]: string },
  ) {
    const { error, context } = options
    super(message, { cause: error })
    this.name = "BaseError"
    this.context = context
    this.code = code
    this.setMessageByCode(code, message)
  }

  private setMessageByCode(code: T | undefined, message: string | undefined) {
    if (!code || !this.errorMessages || message) {
      return
    }

    this.message = this.errorMessages[code]
  }
}
