export function bigIntSort(a: bigint, b: bigint) {
  return a < b ? -1 : a > b ? 1 : 0
}

export function hexBigIntSort(a: string, b: string) {
  return bigIntSort(BigInt(a), BigInt(b))
}
