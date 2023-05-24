export function bytesToUft8(array: ArrayBuffer): string {
  return new TextDecoder("utf-8").decode(array)
}
