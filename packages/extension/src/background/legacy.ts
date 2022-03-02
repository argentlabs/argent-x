import { getFromStorage } from "./storage"

const STORAGE_KEY = "L1:encKeystore"

export const hasLegacy = async () => {
  return Boolean(await getFromStorage(STORAGE_KEY))
}

export const exportLegacyBackup = async () => {
  const backupString = await getFromStorage(STORAGE_KEY)

  const blob = new Blob([backupString as string], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const filename = "starknet-backup.json"
  return { url, filename }
}
