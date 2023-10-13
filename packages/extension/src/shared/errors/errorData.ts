import { JsonValue } from "./baseError"

export interface ErrorData<T> {
  code?: T
  name: string
  message?: string
  context?: JsonValue
}

export interface TRPCError<T> {
  message: string
  data: ErrorData<T>
}

export function isErrorOfType<T>(
  error: unknown,
  errorName: string,
): error is TRPCError<T> {
  return (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    "name" in (error as TRPCError<T>).data &&
    (error as TRPCError<T>).data.name === errorName
  )
}

export function getErrorData<T>(error: unknown) {
  if (typeof error === "object" && error !== null && "data" in error) {
    return error.data as ErrorData<T>
  }
  return null
}
