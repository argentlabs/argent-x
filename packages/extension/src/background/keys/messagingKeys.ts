import { JWK, KeyLike, exportJWK, generateKeyPair, importJWK } from "jose"
import browser from "webextension-polyfill"

export interface MessagingKeys {
  privateKey: KeyLike
  publicKey: KeyLike
  publicKeyJwk: JWK
}

export async function getMessagingKeys(): Promise<MessagingKeys> {
  let privateKey: KeyLike
  let publicKey: KeyLike
  let publicKeyJwk: JWK

  const { PRIVATE_KEY, PUBLIC_KEY } = (await browser.storage.local.get([
    "PRIVATE_KEY",
    "PUBLIC_KEY",
  ])) as { PRIVATE_KEY?: string; PUBLIC_KEY?: string }
  if (!(PRIVATE_KEY && PUBLIC_KEY)) {
    const keypair = await generateKeyPair("ECDH-ES", { extractable: true })

    publicKeyJwk = {
      alg: "ECDH-ES",
      ...(await exportJWK(keypair.publicKey)),
    }

    browser.storage.local.set({
      PRIVATE_KEY: JSON.stringify({
        alg: "ECDH-ES",
        ...(await exportJWK(keypair.privateKey)),
      }),
      PUBLIC_KEY: JSON.stringify(publicKeyJwk),
    })

    privateKey = keypair.privateKey
    publicKey = keypair.publicKey
  } else {
    publicKeyJwk = JSON.parse(PUBLIC_KEY)
    privateKey = (await importJWK(JSON.parse(PRIVATE_KEY))) as KeyLike
    publicKey = (await importJWK(publicKeyJwk)) as KeyLike
  }

  return {
    privateKey,
    publicKey,
    publicKeyJwk,
  }
}
