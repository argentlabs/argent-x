import type { JWK, KeyLike } from "jose"
import { exportJWK, generateKeyPair, importJWK } from "jose"
import browser from "webextension-polyfill"

export interface MessagingKeys {
  privateKey: KeyLike
  publicKey: KeyLike
  publicKeyJwk: JWK
}

const names = ["PRIVATE_KEY", "PUBLIC_KEY"]

export async function getMessagingKeys(): Promise<MessagingKeys> {
  const { PRIVATE_KEY, PUBLIC_KEY } = await browser.storage.local.get(names)

  if (PRIVATE_KEY && PUBLIC_KEY) {
    const privateKeyJwk = JSON.parse(PRIVATE_KEY)
    const publicKeyJwk = JSON.parse(PUBLIC_KEY)
    const privateKey = (await importJWK(privateKeyJwk)) as KeyLike
    const publicKey = (await importJWK(publicKeyJwk)) as KeyLike
    return { privateKey, publicKey, publicKeyJwk }
  }

  const options = { extractable: true }
  const { privateKey, publicKey } = await generateKeyPair("ECDH-ES", options)

  const exportedPrivateKey = await exportJWK(privateKey)
  const exportedPublicKey = await exportJWK(publicKey)

  const privateKeyJwk = { alg: "ECDH-ES", ...exportedPrivateKey }
  const publicKeyJwk = { alg: "ECDH-ES", ...exportedPublicKey }

  void browser.storage.local.set({
    PRIVATE_KEY: JSON.stringify(privateKeyJwk),
    PUBLIC_KEY: JSON.stringify(publicKeyJwk),
  })

  return { privateKey, publicKey, publicKeyJwk }
}
