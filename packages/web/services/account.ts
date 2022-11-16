import { stringToBytes } from "@scure/base"
import { calculateJwkThumbprint, errors, exportJWK } from "jose"
import { Signature, keccak, pedersen, sign } from "micro-starknet"
import { Account, AccountInterface, ec, hash, stark } from "starknet"
import { addHexPrefix, removeHexPrefix } from "starknet/dist/utils/encode"

import { getDevice } from "./__unsafe__oldJwt"
import { addAccount, getAccounts } from "./backend/account"
import { getTextFile, postTextFile } from "./backend/file"
import {
  decryptPrivateKeyWithPassword,
  encryptPrivateKeyWithDeviceKey,
  encryptPrivateKeyWithPassword,
} from "./backup"
import { getNewStarkKeypair } from "./generatePrivateKey"
import { provider } from "./provider"

export const ACCOUNT_IMPLEMENTATION_CLASS_HASH =
  "0x3e327de1c40540b98d05cbcb13552008e36f0ec8d61d46956d2f9752c294328"
export const PROXY_CLASS_HASH =
  "0x25ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918"

export const calculateAccountAddress = (pubKey: string): string => {
  console.time("calculateAccountAddress")
  const accountAddress = hash.calculateContractAddressFromHash(
    pubKey,
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
  console.timeEnd("calculateAccountAddress")

  return accountAddress
}

export const formatAddress = (address: string): string => {
  return `0x${removeHexPrefix(address).slice(0, 4)}...${address.slice(-4)}`
}

let account: AccountInterface | undefined

export const createAccount = async (password: string) => {
  const device = await getDevice()
  // generate a new keypair
  const { publicKey, privateKey } = await getNewStarkKeypair()
  const accountAddress = calculateAccountAddress(publicKey)

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
    encryptPrivateKeyWithDeviceKey(
      privateKey,
      device.encryptionKey.publicKey,
    ).then(async (deviceEncryptedPrivateKey) =>
      postTextFile(
        `device-${await calculateJwkThumbprint(
          await exportJWK(device.encryptionKey.publicKey),
        )}-encypted-${accountAddress}`,
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
    addHexPrefix(r.toString(16)),
    addHexPrefix(s.toString(16)),
  ])
  console.log("privateKey", privateKey)
  const keyPair = ec.getKeyPair(privateKey)
  console.log("public keys match:", ec.getStarkKey(keyPair), publicKey)
  account = new Account(provider, accountAddress, keyPair)

  console.log(
    "precalculated account address",
    accountAddress,
    "server calculated account address",
    registration.address,
  )
  return account
}

export const getAccount = async () => {
  return account
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
    const keyPair = ec.getKeyPair(privateKey)
    console.log("public key:", ec.getStarkKey(keyPair))
    account = new Account(provider, beAccount.address, keyPair)
    return account
  } catch (e) {
    if (e instanceof errors.JWEDecryptionFailed) {
      throw new Error("Wrong password", { cause: e })
    }
    throw e
  }
}
