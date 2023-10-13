export const UNKNOWN_ERROR_MESSAGE = "Unknown error"

export type ErrorObject = Record<string, string>

export const coerceErrorToString = (
  error: any,
  includeStack = true,
): string => {
  const errorObject = getErrorObject(error, includeStack)
  if (errorObject) {
    return JSON.stringify(errorObject, null, 2)
  }
  const errorString = error?.toString?.() || UNKNOWN_ERROR_MESSAGE
  return errorString
}

/** Convert an Error to an object with keys and values by introspecting keys */
/** Conditionally allow tests to exclude the stack trace which is environment-specific */

export const getErrorObject = (
  error: any,
  includeStack = true,
): ErrorObject | undefined => {
  try {
    if (typeof error === "object" && error !== null) {
      const keys = Object.getOwnPropertyNames(error).filter((key) =>
        includeStack ? true : key !== "stack",
      )
      const errorObject: Record<string, string> = {}
      keys.forEach((key) => {
        errorObject[key] = error[key]
      })
      return errorObject
    }
  } catch (e) {
    // ignore parsing error
  }
}
