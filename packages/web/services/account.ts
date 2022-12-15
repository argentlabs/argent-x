import { stringToBytes } from "@scure/base"
import { calculateJwkThumbprint, errors, exportJWK } from "jose"
import { Signature, keccak, pedersen, sign } from "micro-starknet"
import {
  Account,
  AccountInterface,
  KeyPair,
  ec,
  encode,
  hash,
  stark,
} from "starknet"

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
import { getDevice } from "./jwt"
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
let privateKey: string | undefined

const getKeyPair = (_privateKey: string): Promise<KeyPair> => {
  privateKey = _privateKey
  return ec.getKeyPair(_privateKey)
}

const uploadEncryptPrivateKeyWithPassword = async (
  password: string,
  privateKey: string,
  update: boolean,
): Promise<void> => {
  const publicKey = ec.getStarkKey(getKeyPair(privateKey))
  const passwordEncryptedPrivateKey = await encryptPrivateKeyWithPassword(
    privateKey,
    password,
  )

  await postTextFile(
    `password-encypted-${publicKey}`,
    passwordEncryptedPrivateKey,
    { update, accessPolicy: "WEB_WALLET_PASSWORD_ENCRYPTED_KEY" },
  )
}

export const changePassword = async (newPassword: string): Promise<void> => {
  if (!account || !privateKey) {
    throw new Error("not logged in")
  }
  await uploadEncryptPrivateKeyWithPassword(newPassword, privateKey, true)
}

export const createAccount = async (password: string) => {
  // generate a new keypair
  const { publicKey, privateKey } = await getNewStarkKeypair()

  // upload encrypted backups in parallel
  const uploadEncryptedFilesPromises = [
    uploadEncryptPrivateKeyWithPassword(password, privateKey, false),
    ensureDeviceBackup(privateKey),
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

  await Promise.all([createSession(privateKey), ensureDeviceBackup(privateKey)])

  const keyPair = getKeyPair(privateKey)
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

    const uploadEncryptedFilesPromises = [
      createSession(privateKey),
      ensureDeviceBackup(privateKey),
    ]

    const keyPair = getKeyPair(privateKey)
    account = new Account(provider, beAccount.address, keyPair)

    await Promise.all(uploadEncryptedFilesPromises)

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

    await Promise.all([
      createSession(privateKey),
      ensureDeviceBackup(privateKey),
    ])

    const keyPair = getKeyPair(privateKey)
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
      ensureDeviceBackup(privateKey),
    ])
    const keyPair = getKeyPair(privateKey)
    account = new Account(provider, beAccount.address, keyPair)
    return account
  } catch (e) {
    if (e instanceof errors.JWEDecryptionFailed) {
      throw new Error("Wrong password", { cause: e })
    }
    throw e
  }
}

// ensure device backup is available
export const ensureDeviceBackup = async (privateKey: string) => {
  const device = await getDevice()
  const publicKey = ec.getStarkKey(getKeyPair(privateKey))

  try {
    const deviceEncryptedPrivateKey = await getTextFile(
      `device-${await calculateJwkThumbprint(
        await exportJWK(device.encryptionKey.publicKey),
      )}-encypted-${publicKey}`,
    )

    if (!deviceEncryptedPrivateKey) {
      throw new Error("Device backup not found")
    }
  } catch (e) {
    if (e instanceof Error && e.message === "file not found") {
      console.warn("Device backup not found")

      const publicKey = ec.getStarkKey(getKeyPair(privateKey))
      const deviceEncryptedPrivateKey = await encryptPrivateKeyWithKey(
        privateKey,
        device.encryptionKey.publicKey,
      )
      await postTextFile(
        `device-${await calculateJwkThumbprint(
          await exportJWK(device.encryptionKey.publicKey),
        )}-encypted-${publicKey}`,
        deviceEncryptedPrivateKey,
        { accessPolicy: "WEB_WALLET_PASSWORD_ENCRYPTED_KEY" }, // TODO: [BE] change as soon as the backend is ready
      )
    } else {
      throw e
    }
  }
}
