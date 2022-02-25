import { getFromStorage, setToStorage } from "./storage"

export async function preAuthorize(host: string) {
  const approved = await getFromStorage<string[]>(`PREAUTHORIZATION:APPROVED`)
  await setToStorage(`PREAUTHORIZATION:APPROVED`, [...(approved || []), host])
}

export async function getPreAuthorizations() {
  const approved = await getFromStorage<string[]>(`PREAUTHORIZATION:APPROVED`)
  return approved || []
}

export async function removePreAuthorization(host: string) {
  const approved = await getFromStorage<string[]>(`PREAUTHORIZATION:APPROVED`)
  await setToStorage(
    `PREAUTHORIZATION:APPROVED`,
    (approved || []).filter((x) => x !== host),
  )
}

export async function isPreAuthorized(host: string) {
  const approved = await getFromStorage<string[]>(`PREAUTHORIZATION:APPROVED`)
  return (approved || []).includes(host)
}
