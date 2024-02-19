// Utility function to determine order of values in an array
export const arrayOrderWith = <T>(
  array: T[],
  valueA: T,
  valueB: T,
  compareFn: (a: T, b: T) => boolean,
): number => {
  const indexA = array.findIndex((v) => compareFn(v, valueA))
  const indexB = array.findIndex((v) => compareFn(v, valueB))
  if (indexA === -1) return 1
  if (indexB === -1) return -1
  return indexA - indexB
}
