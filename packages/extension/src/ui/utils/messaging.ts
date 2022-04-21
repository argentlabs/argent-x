import {
  CompactEncrypt,
  exportJWK,
  generateSecret,
  importJWK,
  jwtDecrypt,
} from "jose"
import { Call, encode, number } from "starknet"

import { CustomNetwork } from "../../shared/customNetworks"
import {
  messageStream,
  sendMessage,
  waitForMessage,
} from "../../shared/messages"

if (process.env.NODE_ENV === "development") {
  messageStream.subscribe(([message]) => {
    console.log("Received message", message)
  })
}

export const getActions = async () => {
  sendMessage({ type: "GET_ACTIONS" })
  return waitForMessage("GET_ACTIONS_RES")
}

export const upgradeAccount = async (walletAddress: string) => {
  sendMessage({ type: "UPGRADE_ACCOUNT", data: { walletAddress } })
  return waitForMessage("TRANSACTION_UPDATES")
}

export const getTransactions = async (address: string) => {
  sendMessage({ type: "GET_TRANSACTIONS" })
  const allTransactions = await waitForMessage("GET_TRANSACTIONS_RES")
  return allTransactions.filter(
    ({ accountAddress }) => accountAddress === address,
  )
}

export const getTransactionStatus = async (hash: string, network: string) => {
  sendMessage({ type: "GET_TRANSACTION", data: { hash, network } })
  return waitForMessage(
    "GET_TRANSACTION_RES",
    (status) => status.data.hash === hash,
  )
}

export const getLastSelectedAccount = async () => {
  sendMessage({ type: "GET_SELECTED_ACCOUNT" })
  return waitForMessage("GET_SELECTED_ACCOUNT_RES")
}

export const getPublicKey = async () => {
  sendMessage({ type: "GET_PUBLIC_KEY" })
  return waitForMessage("GET_PUBLIC_KEY_RES")
}

export const recoverBackup = async (backup: string) => {
  sendMessage({ type: "RECOVER_BACKUP", data: backup })

  await Promise.race([
    waitForMessage("RECOVER_BACKUP_RES"),
    waitForMessage("RECOVER_BACKUP_REJ").then((error) => {
      throw new Error(error)
    }),
  ])
}

export const isInitialized = async () => {
  sendMessage({ type: "IS_INITIALIZED" })
  return await waitForMessage("IS_INITIALIZED_RES")
}

export const hasActiveSession = async () => {
  sendMessage({ type: "HAS_SESSION" })
  return waitForMessage("HAS_SESSION_RES")
}

export const getAccounts = async () => {
  sendMessage({ type: "GET_ACCOUNTS" })
  return waitForMessage("GET_ACCOUNTS_RES")
}

export const getEstimatedFee = async (call: Call | Call[]) => {
  sendMessage({ type: "ESTIMATE_TRANSACTION_FEE", data: call })
  return waitForMessage("ESTIMATE_TRANSACTION_FEE_RES")
}

export const getSeedPhrase = async (): Promise<string> => {
  const otpKey = await generateSecret("A256GCM", { extractable: true })
  const otpBuffer = encode.utf8ToArray(
    JSON.stringify({
      alg: "A256GCM",
      ...(await exportJWK(otpKey)),
    }),
  )
  const pubJwk = await getPublicKey()
  const pubKey = await importJWK(pubJwk)

  const encryptedSecret = await new CompactEncrypt(otpBuffer)
    .setProtectedHeader({ alg: "ECDH-ES", enc: "A256GCM" })
    .encrypt(pubKey)

  sendMessage({
    type: "GET_ENCRYPTED_SEED_PHRASE",
    data: {
      encryptedSecret,
    },
  })

  const { encryptedSeedPhrase } = await waitForMessage(
    "GET_ENCRYPTED_SEED_PHRASE_RES",
  )

  const { payload } = await jwtDecrypt(encryptedSeedPhrase, otpKey)

  return payload.seedPhrase as string
}

export const recoverBySeedPhrase = async (
  seedPhrase: string,
  newPassword: string,
): Promise<void> => {
  const pubJwk = await getPublicKey()
  const pubKey = await importJWK(pubJwk)

  const msgJson = JSON.stringify({
    seedPhrase,
    newPassword,
  })

  const encMsg = await new CompactEncrypt(encode.utf8ToArray(msgJson))
    .setProtectedHeader({ alg: "ECDH-ES", enc: "A256GCM" })
    .encrypt(pubKey)

  sendMessage({
    type: "RECOVER_SEEDPHRASE",
    data: { secure: true, body: encMsg },
  })

  const succeeded = await Promise.race([
    waitForMessage("RECOVER_SEEDPHRASE_RES").then(() => true),
    waitForMessage("RECOVER_SEEDPHRASE_REJ")
      .then(() => false)
      .catch(() => false),
  ])

  if (!succeeded) {
    throw Error("Invalid Seed Phrase")
  }
}

export const updateTransactionFee = async (
  actionHash: string,
  maxFee: number.BigNumberish,
) => {
  sendMessage({ type: "UPDATE_TRANSACTION_FEE", data: { actionHash, maxFee } })
  return waitForMessage(
    "UPDATE_TRANSACTION_FEE_RES",
    (x) => x.data.actionHash === actionHash,
  )
}

export const startSession = async (password: string): Promise<void> => {
  const pubJwk = await getPublicKey()
  const pubKey = await importJWK(pubJwk)

  const encMsg = await new CompactEncrypt(encode.utf8ToArray(password))
    .setProtectedHeader({ alg: "ECDH-ES", enc: "A256GCM" })
    .encrypt(pubKey)

  sendMessage({ type: "START_SESSION", data: { secure: true, body: encMsg } })

  const succeeded = await Promise.race([
    waitForMessage("START_SESSION_RES").then(() => true),
    waitForMessage("START_SESSION_REJ")
      .then(() => false)
      .catch(() => false),
  ])

  if (!succeeded) {
    throw Error("Wrong password")
  }
}

export const deleteAccount = async (address: string) => {
  sendMessage({ type: "DELETE_ACCOUNT", data: address })

  try {
    await Promise.race([
      waitForMessage("DELETE_ACCOUNT_RES"),
      waitForMessage("DELETE_ACCOUNT_REJ").then(() => {
        throw new Error("Rejected")
      }),
    ])
  } catch (e) {
    throw Error("Could not delete account")
  }
}

export const removePreAuthorization = async (host: string) => {
  sendMessage({
    type: "REMOVE_PREAUTHORIZATION",
    data: host,
  })
  await waitForMessage("REMOVE_PREAUTHORIZATION_RES")
}

export const getCustomNetworks = async () => {
  sendMessage({ type: "GET_CUSTOM_NETWORKS" })
  return waitForMessage("GET_CUSTOM_NETWORKS_RES")
}

export const addCustomNetworks = async (networks: CustomNetwork[]) => {
  sendMessage({ type: "ADD_CUSTOM_NETWORKS", data: networks })
  return waitForMessage("ADD_CUSTOM_NETWORKS_RES")
}

export const removeCustomNetworks = async (networks: CustomNetwork["id"][]) => {
  sendMessage({ type: "REMOVE_CUSTOM_NETWORKS", data: networks })
  return waitForMessage("REMOVE_CUSTOM_NETWORKS_RES")
}
