export const UNKNOWN_ERROR_MESSAGE = "Unknown error"

export const coerceErrorToString = (error: any): string => {
  const errorObject = getErrorObject(error)
  if (errorObject) {
    return JSON.stringify(errorObject, null, 2)
  }
  const errorString = error?.toString?.() || UNKNOWN_ERROR_MESSAGE
  return errorString
}

/** Convert an Error to an object with keys and values by introspecting keys */
export const getErrorObject = (error: any) => {
  try {
    if (typeof error === "object" && error !== null) {
      /** ignore the stack trace which is environment-specific and handled by ErrorBoundary */
      const keys = Object.getOwnPropertyNames(error).filter(
        (key) => key !== "stack",
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
