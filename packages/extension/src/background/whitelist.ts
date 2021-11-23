import { getFromStorage, setToStorage } from "./storage"

export async function addToWhitelist(host: string) {
  const approved = await getFromStorage<string[]>(`WHITELIST:APPROVED`)
  await setToStorage(`WHITELIST:APPROVED`, [...(approved || []), host])
}

export async function removeFromWhitelist(host: string) {
  const approved = await getFromStorage<string[]>(`WHITELIST:APPROVED`)
  await setToStorage(
    `WHITELIST:APPROVED`,
    (approved || []).filter((x) => x !== host),
  )
}

export async function isOnWhitelist(host: string) {
  const approved = await getFromStorage<string[]>(`WHITELIST:APPROVED`)
  return (approved || []).includes(host)
}
