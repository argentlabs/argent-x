export const ensureArray = <T>(maybeArray: T | T[] | undefined): T[] => {
  /**
   * Ensures that the input value is always returned as an array, even if it's already an array,
   * a single value, or undefined. This function is useful for standardizing input values to arrays.
   *
   * @param maybeArray - The input value that should be converted to an array if necessary.
   * @returns An array containing the input value, or an empty array if the input is undefined or null.
   */
  if (maybeArray === undefined || maybeArray === null) {
    return []
  }
  if (Array.isArray(maybeArray)) {
    return maybeArray
  }
  return [maybeArray]
}
