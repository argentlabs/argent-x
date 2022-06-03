import { BigNumber } from "ethers"
import { Call, number } from "starknet"

import {
  messageStream,
  sendMessage,
  waitForMessage,
} from "../../shared/messages"
import { Network } from "../../shared/networks"
import { Token } from "../../shared/token"
import {
  decryptFromBackground,
  encryptForBackground,
  generateEncryptedSecret,
} from "./crypto"

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
  return allTransactions.filter(({ account }) => account.address === address)
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

export const getMessagingPublicKey = async () => {
  sendMessage({ type: "GET_MESSAGING_PUBLIC_KEY" })
  return waitForMessage("GET_MESSAGING_PUBLIC_KEY_RES")
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

  const response = await Promise.race([
    waitForMessage("ESTIMATE_TRANSACTION_FEE_RES"),
    waitForMessage("ESTIMATE_TRANSACTION_FEE_REJ").then(() => {
      throw new Error("Failed to estimate fee")
    }),
  ])

  return {
    ...response,
    amount: BigNumber.from(response.amount),
    suggestedMaxFee: BigNumber.from(response.suggestedMaxFee),
  }
}

export const getSeedPhrase = async (): Promise<string> => {
  const { secret, encryptedSecret } = await generateEncryptedSecret()
  sendMessage({
    type: "GET_ENCRYPTED_SEED_PHRASE",
    data: { encryptedSecret },
  })

  const { encryptedSeedPhrase } = await waitForMessage(
    "GET_ENCRYPTED_SEED_PHRASE_RES",
  )

  return await decryptFromBackground(encryptedSeedPhrase, secret)
}

export const recoverBySeedPhrase = async (
  seedPhrase: string,
  newPassword: string,
): Promise<void> => {
  const msgJson = JSON.stringify({
    seedPhrase,
    newPassword,
  })

  sendMessage({
    type: "RECOVER_SEEDPHRASE",
    data: { secure: true, body: await encryptForBackground(msgJson) },
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
  const body = await encryptForBackground(password)

  sendMessage({ type: "START_SESSION", data: { secure: true, body } })

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

export const checkPassword = async (password: string): Promise<boolean> => {
  const body = await encryptForBackground(password)

  sendMessage({ type: "CHECK_PASSWORD", data: { body } })

  return await Promise.race([
    waitForMessage("CHECK_PASSWORD_RES").then(() => true),
    waitForMessage("CHECK_PASSWORD_REJ")
      .then(() => false)
      .catch(() => false),
  ])
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

export const getNetworks = async () => {
  sendMessage({ type: "GET_CUSTOM_NETWORKS" })
  return waitForMessage("GET_CUSTOM_NETWORKS_RES")
}

export const getNetwork = async (
  networkId: string,
): Promise<Network | undefined> => {
  const result = await getNetworks()
  return result.find((x) => x.id === networkId)
}

export const addNetworks = async (networks: Network[]) => {
  sendMessage({ type: "ADD_CUSTOM_NETWORKS", data: networks })
  return waitForMessage("ADD_CUSTOM_NETWORKS_RES")
}

export const removeNetworks = async (networks: Network["id"][]) => {
  sendMessage({ type: "REMOVE_CUSTOM_NETWORKS", data: networks })
  return waitForMessage("REMOVE_CUSTOM_NETWORKS_RES")
}

export const getNetworkStatuses = async (networks: Network[] = []) => {
  sendMessage({ type: "GET_NETWORK_STATUSES", data: networks })
  return waitForMessage("GET_NETWORK_STATUSES_RES")
}

export const getTokens = async () => {
  sendMessage({ type: "GET_TOKENS" })
  return waitForMessage("GET_TOKENS_RES")
}

export const removeToken = async (address: string) => {
  sendMessage({ type: "REMOVE_TOKEN", data: address })
  return waitForMessage("REMOVE_TOKEN_RES")
}

export const addToken = async (token: Token) => {
  sendMessage({ type: "ADD_TOKEN", data: token })
  return waitForMessage("ADD_TOKEN_RES")
}

export const getPrivateKey = async () => {
  const { secret, encryptedSecret } = await generateEncryptedSecret()
  sendMessage({
    type: "GET_ENCRYPTED_PRIVATE_KEY",
    data: { encryptedSecret },
  })

  const { encryptedPrivateKey } = await waitForMessage(
    "GET_ENCRYPTED_PRIVATE_KEY_RES",
  )

  return await decryptFromBackground(encryptedPrivateKey, secret)
}

// for debugging purposes
try {
  ;(window as any).downloadBackup = () => {
    sendMessage({ type: "DOWNLOAD_BACKUP_FILE" })
  }
} catch {
  // ignore
}
