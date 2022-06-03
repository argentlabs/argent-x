import {
  messageStream,
  sendMessage,
  waitForMessage,
} from "../../shared/messages"
import { Network } from "../../shared/networks"
import { encryptForBackground } from "./crypto"

if (process.env.NODE_ENV === "development") {
  messageStream.subscribe(([message]) => {
    console.log("Received message", message)
  })
}

export const getActions = async () => {
  sendMessage({ type: "GET_ACTIONS" })
  return waitForMessage("GET_ACTIONS_RES")
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

// for debugging purposes
try {
  ;(window as any).downloadBackup = () => {
    sendMessage({ type: "DOWNLOAD_BACKUP_FILE" })
  }
} catch {
  // ignore
}
