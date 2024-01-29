import oHash from "object-hash"

export function objectHash(obj: object | null) {
  return oHash(obj, { unorderedArrays: true })
}
