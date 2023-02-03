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
): Promise<boolean> => {
  const message = JSON.stringify({ seedPhrase, newPassword })
  const body = await encryptForBackground(message)

  sendMessage({
    type: "RECOVER_SEEDPHRASE",
    data: { secure: true, body },
  })

  const isSuccess = await Promise.race([
    waitForMessage("RECOVER_SEEDPHRASE_RES").then(() => true),
    waitForMessage("RECOVER_SEEDPHRASE_REJ").then(() => false),
  ])

  return isSuccess
}

export const downloadBackupFile = () => {
  sendMessage({ type: "DOWNLOAD_BACKUP_FILE" })
}

// for debugging purposes
try {
  ;(window as any).downloadBackup = downloadBackupFile
} catch {
  // ignore
}
