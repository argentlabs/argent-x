/**
 * Asserts type never on the passed argument. Does throw in runtime.
 *
 * @param _ value to assert never
 */
export const assertNever = (_: never): never => {
  throw new Error("never")
}

/**
 * Asserts type never on the passed argument. Does **not** throw in runtime.
 *
 * @param _ value to assert never
 */
export const assertNeverStatic = (_: never): void => {
  // noop
}
