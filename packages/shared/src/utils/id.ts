import { keccak_256 } from "@noble/hashes/sha3"
import { utf8ToBytes, bytesToHex } from "@noble/hashes/utils"

/**
 *  A simple hashing function which operates on UTF-8 strings to
 *  compute an 32-byte identifier.
 *
 *  This simply computes the [UTF-8 bytes](toUtf8Bytes) and computes
 *  the [[keccak256]].
 *
 *  @example:
 *    id("hello world")
 *    //_result: "0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad"
 */
export function id(value: string): string {
  return `0x${bytesToHex(keccak_256(utf8ToBytes(value)))}`
}
