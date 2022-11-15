import { stringToBytes } from "@scure/base"
import { calculateJwkThumbprint, exportJWK } from "jose"
import { Signature, keccak, pedersen, sign, utils } from "micro-starknet"
import { hash, stark } from "starknet"
import { addHexPrefix } from "starknet/dist/utils/encode"

import { getDevice } from "./__unsafe__oldJwt"
import { addAccount } from "./backend/account"
import { postTextFile } from "./backend/file"
import {
  encryptPrivateKeyWithDeviceKey,
  encryptPrivateKeyWithPassword,
} from "./backup"
import { getNewStarkKeypair } from "./generatePrivateKey"

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
          `password-encypted-${accountAddress}`,
          passwordEncryptedPrivateKey,
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

  // when one of the uploads is done we can optimistically request registration of the account
  await Promise.race(uploadEncryptedFilesPromises)

  const registration = await addAccount(publicKey, [
    addHexPrefix(r.toString(16)),
    addHexPrefix(s.toString(16)),
  ])

  // after registration we can wait for the other uploads to finish
  await Promise.all(uploadEncryptedFilesPromises)

  console.log(
    "precalculated account address",
    accountAddress,
    "server calculated account address",
    registration,
  )
}
