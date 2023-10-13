export function bytesToUft8(array: ArrayBuffer): string {
  return new TextDecoder("utf-8").decode(array)
}

/**
 * BUGGY_bytesToUft8 is a buggy version of bytesToUft8. This version is needed, as we always decoded passwords with this buggy version. So switching to the correct version would break all existing passwords.
 *
 * @deprecated This function is buggy and should not be used. Use `bytesToUft8` instead.
 * @param array - The array to convert to a string.
 * @returns The string representation of the array with mistakes.
 */
export function BUGGY_bytesToUft8(array: ArrayBuffer): string {
  return new Uint8Array(array).reduce(
    (data, byte) => data + String.fromCharCode(byte),
    "",
  )
}
