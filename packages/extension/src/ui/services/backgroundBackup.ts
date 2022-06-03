import { sendMessage, waitForMessage } from "../../shared/messages"
import { encryptForBackground } from "./crypto"

export const recoverBackup = async (backup: string) => {
  sendMessage({ type: "RECOVER_BACKUP", data: backup })

  await Promise.race([
    waitForMessage("RECOVER_BACKUP_RES"),
    waitForMessage("RECOVER_BACKUP_REJ").then((error) => {
      throw new Error(error)
    }),
  ])
}

export const recoverBySeedPhrase = async (
  seedPhrase: string,
  newPassword: string,
): Promise<void> => {
  const message = JSON.stringify({ seedPhrase, newPassword })
  const body = await encryptForBackground(message)

  sendMessage({
    type: "RECOVER_SEEDPHRASE",
    data: { secure: true, body },
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

// for debugging purposes
try {
  ;(window as any).downloadBackup = () => {
    sendMessage({ type: "DOWNLOAD_BACKUP_FILE" })
  }
} catch {
  // ignore
}
