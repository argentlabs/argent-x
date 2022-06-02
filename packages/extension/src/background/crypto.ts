import { EncryptJWT, KeyLike, compactDecrypt, importJWK } from "jose"
import { encode } from "starknet"

export const encryptForUi = async (
  value: string,
  encryptedSecret: string,
  privateKey: KeyLike,
) => {
  const { plaintext } = await compactDecrypt(encryptedSecret, privateKey)

  const jwk = JSON.parse(encode.arrayBufferToString(plaintext))
  const symmetricSecret = await importJWK(jwk)

  return await new EncryptJWT({ value })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .encrypt(symmetricSecret)
}
