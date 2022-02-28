import { CompactEncrypt, importJWK } from "jose"
import { encode } from "starknet"

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
  sendMessage({
    type: "RECOVER_BACKUP",
    data: backup,
  })
  return waitForMessage("RECOVER_BACKUP_RES")
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
