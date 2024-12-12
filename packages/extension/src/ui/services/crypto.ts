import type { KeyLike } from "jose"
import {
  CompactEncrypt,
  exportJWK,
  generateSecret,
  importJWK,
  jwtDecrypt,
} from "jose"
import { isString } from "lodash-es"
import { encode } from "starknet"

import { getMessagingPublicKey } from "./background"

export const encryptForBackground = async (value: string | Uint8Array) => {
  const pubJwk = await getMessagingPublicKey()
  const pubKey = await importJWK(pubJwk)

  const plaintext = isString(value) ? encode.utf8ToArray(value) : value
  return await new CompactEncrypt(plaintext)
    .setProtectedHeader({ alg: "ECDH-ES", enc: "A256GCM" })
    .encrypt(pubKey)
}

export const decryptFromBackground = async (
  encryptedValue: string,
  secret: Uint8Array | KeyLike,
) => {
  const { payload } = await jwtDecrypt(encryptedValue, secret)
  return payload.value as string
}

export const generateEncryptedSecret = async () => {
  const secret = await generateSecret("A256GCM", { extractable: true })
  const value = { alg: "A256GCM", ...(await exportJWK(secret)) }
  const otpBuffer = encode.utf8ToArray(JSON.stringify(value))
  const encryptedSecret = await encryptForBackground(otpBuffer)
  return { secret, encryptedSecret }
}
