import { ArrayStorage } from "../shared/storage"

const preAuthStore = new ArrayStorage<string>([], "core:preAuth")

export async function preAuthorize(host: string) {
  await preAuthStore.push(host)
}

export async function getPreAuthorizations() {
  return preAuthStore.get()
}

export async function removePreAuthorization(host: string) {
  await preAuthStore.remove(host)
}

export async function isPreAuthorized(host: string) {
  const [hit] = await preAuthStore.get((h) => h === host)
  return !!hit
}

export async function resetPreAuthorizations() {
  await preAuthStore.remove(() => true)
}
