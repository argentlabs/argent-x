import { calculateJwkThumbprint, exportJWK, generateKeyPair } from "jose"

import { postTextFile } from "./backend/file"
import { encryptPrivateKeyWithKey } from "./backup"
import { Session, idb } from "./idb"
import { genKeyPairOpts } from "./jwt"

export const createSession = async (privateKey: string): Promise<Session> => {
  const encryptionKey = await generateKeyPair("ECDH-ES+A256KW", genKeyPairOpts)
  const expiresAt =
    // 5 minutes in production, 1 minute in development
    Date.now() + (process.env.NODE_ENV === "development" ? 1 : 5) * 60 * 1000

  const newSession = {
    id: 0,
    encryptionKey,
    expiresAt,
  }

  // encrypt the private key with the session encryption key
  const sessionEncryptedPrivateKey = await encryptPrivateKeyWithKey(
    privateKey,
    newSession.encryptionKey.publicKey,
  )
  const sessionThumbprint = await exportJWK(
    newSession.encryptionKey.publicKey,
  ).then((jwk) => calculateJwkThumbprint(jwk))

  await postTextFile(
    `session-${sessionThumbprint}`,
    sessionEncryptedPrivateKey,
    {
      accessPolicy: "WEB_WALLET_SESSION",
    },
  )

  await idb.session.put(newSession)

  return newSession
}

export const getSession = async (): Promise<Session> => {
  const session = await idb.session.get(0)

  if (!session) {
    throw new Error("session not found")
  }

  if (session.expiresAt < Date.now()) {
    throw new Error("session expired")
  }

  return session
}
