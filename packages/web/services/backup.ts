import { ScryptOpts, scryptAsync } from "@noble/hashes/scrypt"
import { bytesToHex, hexToBytes, randomBytes } from "@noble/hashes/utils"
import {
  EncryptJWT,
  KeyLike,
  calculateJwkThumbprint,
  decodeProtectedHeader,
  exportJWK,
  jwtDecrypt,
} from "jose"

const scryptOpts: ScryptOpts = {
  p: 1,
  r: 8,
  N: 2 ** 18, // 262144
}

export const encryptPrivateKeyWithPassword = async (
  privateKey: string,
  password: string,
): Promise<string> => {
  const salt = randomBytes(32)

  const key = await scryptAsync(password, salt, scryptOpts)

  const encryptedPrivateKey = await new EncryptJWT({
    privateKey,
  })
    .setProtectedHeader({
      alg: "dir",
      enc: "A256GCM",
      salt: bytesToHex(salt),
    })
    .encrypt(key)

  return encryptedPrivateKey
}

export const decryptPrivateKeyWithPassword = async (
  encryptedPrivateKey: string,
  password: string,
): Promise<string> => {
  const { salt } = decodeProtectedHeader(encryptedPrivateKey)

  if (typeof salt !== "string") {
    throw new Error("salt is not provided in the protected header")
  }

  const key = await scryptAsync(password, hexToBytes(salt), scryptOpts)

  const {
    payload: { privateKey },
  } = await jwtDecrypt(encryptedPrivateKey, key)

  if (typeof privateKey !== "string") {
    throw new Error("private key not found in the payload")
  }

  return privateKey
}

export const encryptPrivateKeyWithKey = async (
  privateKey: string,
  encPublicKey: KeyLike,
): Promise<string> => {
  const encryptedPrivateKey = await new EncryptJWT({
    privateKey,
  })
    .setProtectedHeader({
      alg: "ECDH-ES+A256KW",
      enc: "A256GCM",
      kid: await calculateJwkThumbprint(await exportJWK(encPublicKey)),
    })
    .encrypt(encPublicKey)

  return encryptedPrivateKey
}

export const decryptPrivateKeyWithKey = async (
  encryptedPrivateKey: string,
  encPrivateKey: KeyLike,
): Promise<string> => {
  const {
    payload: { privateKey },
  } = await jwtDecrypt(encryptedPrivateKey, encPrivateKey)

  if (typeof privateKey !== "string") {
    throw new Error("private key not found in the payload")
  }

  return privateKey
}
