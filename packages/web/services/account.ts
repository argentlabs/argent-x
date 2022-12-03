import { stringToBytes } from "@scure/base"
import { calculateJwkThumbprint, errors, exportJWK } from "jose"
import { Signature, keccak, pedersen, sign } from "micro-starknet"
import { Account, AccountInterface, ec, encode, hash, stark } from "starknet"

import { getDevice } from "./__unsafe__oldJwt"
import {
  Account as BeAccount,
  addAccount,
  getAccounts,
} from "./backend/account"
import { getTextFile, postTextFile } from "./backend/file"
import {
  decryptPrivateKeyWithKey,
  decryptPrivateKeyWithPassword,
  encryptPrivateKeyWithKey,
  encryptPrivateKeyWithPassword,
} from "./backup"
import { getNewStarkKeypair } from "./generatePrivateKey"
import { provider } from "./provider"
import { createSession, getSession } from "./session"

export const ACCOUNT_IMPLEMENTATION_CLASS_HASH =
  "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2"
export const PROXY_CLASS_HASH =
  "0x25ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918"

export const calculateAccountAddress = (
  pubKey: string,
  salt: string,
): string => {
  const accountAddress = hash.calculateContractAddressFromHash(
    salt,
    PROXY_CLASS_HASH,
    stark.compileCalldata({
      implementation: ACCOUNT_IMPLEMENTATION_CLASS_HASH,
      selector: hash.getSelectorFromName("initialize"),
      calldata: stark.compileCalldata({
        signer: pubKey,
        guardian: "0",
      }),
    }),
    0,
  )

  return accountAddress
}

export const formatAddress = (address: string): string => {
  return `0x${encode.removeHexPrefix(address).slice(0, 4)}...${address.slice(
    -4,
  )}`
}

let account: AccountInterface | undefined

export const createAccount = async (password: string) => {
  const device = await getDevice()
  // generate a new keypair
  const { publicKey, privateKey } = await getNewStarkKeypair()

  // upload encrypted backups in parallel
  const uploadEncryptedFilesPromises = [
    encryptPrivateKeyWithPassword(privateKey, password).then(
      (passwordEncryptedPrivateKey) =>
        postTextFile(
          `password-encypted-${publicKey}`,
          passwordEncryptedPrivateKey,
          { accessPolicy: "WEB_WALLET_KEY" },
        ),
    ),
    encryptPrivateKeyWithKey(privateKey, device.encryptionKey.publicKey).then(
      async (deviceEncryptedPrivateKey) =>
        postTextFile(
          `device-${await calculateJwkThumbprint(
            await exportJWK(device.encryptionKey.publicKey),
          )}-encypted-${publicKey}`,
          deviceEncryptedPrivateKey,
          { accessPolicy: "WEB_WALLET_SESSION" }, // TODO: [BE] change as soon as the backend is ready
        ),
    ),
  ]

  // signature = sign(
  //   pedersen([starknetKeccak("starknet"), starkPub]))
  const deploySignature = sign(
    pedersen(keccak(stringToBytes("utf8", "starknet")), publicKey),
    privateKey,
  )
  const { r, s } = Signature.fromHex(deploySignature)

  await Promise.all(uploadEncryptedFilesPromises)

  const registration = await addAccount(publicKey, [
    encode.addHexPrefix(r.toString(16)),
    encode.addHexPrefix(s.toString(16)),
  ])

  await createSession(privateKey)

  const keyPair = ec.getKeyPair(privateKey)
  account = new Account(provider, registration.address, keyPair)

  return account
}

export const getAccount = async () => {
  return account
}

export const retrieveAccountWithDevice = async () => {
  try {
    const device = await getDevice()
    const [beAccount] = await getAccounts()

    const deviceEncryptedPrivateKey = await getTextFile(
      `device-${await calculateJwkThumbprint(
        await exportJWK(device.encryptionKey.publicKey),
      )}-encypted-${beAccount.ownerAddress}`,
    )

    const privateKey = await decryptPrivateKeyWithKey(
      deviceEncryptedPrivateKey,
      device.encryptionKey.privateKey,
    )

    const keyPair = ec.getKeyPair(privateKey)
    account = new Account(provider, beAccount.address, keyPair)

    return account
  } catch (error) {
    if (error instanceof errors.JOSEError) {
      throw new Error("Failed to decrypt private key")
    }

    throw error
  }
}

export const retrieveAccountWithPassword = async (password: string) => {
  try {
    const [beAccount] = await getAccounts()
    const passwordEncryptedPrivateKey = await getTextFile(
      `password-encypted-${beAccount.ownerAddress}`,
    )
    const privateKey = await decryptPrivateKeyWithPassword(
      passwordEncryptedPrivateKey,
      password,
    )

    await createSession(privateKey)

    const keyPair = ec.getKeyPair(privateKey)
    account = new Account(provider, beAccount.address, keyPair)
    return account
  } catch (e) {
    if (e instanceof errors.JWEDecryptionFailed) {
      throw new Error("Wrong password", { cause: e })
    }
    throw e
  }
}

export const retrieveAccountFromSession = async (
  providedBeAccount?: BeAccount,
) => {
  try {
    const session = await getSession()
    const sessionThumbprint = await exportJWK(
      session.encryptionKey.publicKey,
    ).then((jwk) => calculateJwkThumbprint(jwk))
    const sessionEncryptedPrivateKey = await getTextFile(
      `session-${sessionThumbprint}`,
    )

    const privateKey = await decryptPrivateKeyWithKey(
      sessionEncryptedPrivateKey,
      session.encryptionKey.privateKey,
    )

    const [[beAccount]] = await Promise.all([
      providedBeAccount ? Promise.resolve([providedBeAccount]) : getAccounts(),
      createSession(privateKey),
    ])
    const keyPair = ec.getKeyPair(privateKey)
    account = new Account(provider, beAccount.address, keyPair)
    return account
  } catch (e) {
    if (e instanceof errors.JWEDecryptionFailed) {
      throw new Error("Wrong password", { cause: e })
    }
    throw e
  }
}
