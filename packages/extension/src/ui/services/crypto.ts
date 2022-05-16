import { CompactEncrypt, importJWK } from "jose"
import { isString } from "lodash-es"
import { encode } from "starknet"

import { getPublicKey } from "./messaging"

export const encrypt = async (value: string | Uint8Array) => {
  const pubJwk = await getPublicKey()
  const pubKey = await importJWK(pubJwk)

  const plaintext = isString(value) ? encode.utf8ToArray(value) : value
  return await new CompactEncrypt(plaintext)
    .setProtectedHeader({ alg: "ECDH-ES", enc: "A256GCM" })
    .encrypt(pubKey)
}
