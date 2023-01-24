import { idb } from "./idb"
import { getDevice } from "./jwt"

export const updateVerifiedEmail = async (email?: string) => {
  await idb.transaction("rw", idb.devices, async () => {
    const device = await getDevice()
    device.verifiedEmail = email
    device.verifiedAt = new Date().toISOString()
    await idb.devices.put(device)
  })
}

export const getVerifiedEmail = async () => {
  const device = await idb.devices.get(0)
  return device?.verifiedEmail
}

export const getVerifiedEmailAge = async () => {
  const device = await idb.devices.get(0)
  if (device?.verifiedAt) {
    const age = Math.abs(
      new Date().getTime() - new Date(device.verifiedAt).getTime(),
    )
    return age
  }
  throw new Error("Argent Shield email not verified")
}

/** backend expiry is 30 days, be optimistic and check 29 here */

export const getVerifiedEmailIsExpired = async () => {
  const age = await getVerifiedEmailAge()
  const days = age / (1000 * 60 * 60 * 24)
  return days > 29
}

/** for guardian removal, backend expiry is 30 minutes, be optimistic and check 25 here */

export const getVerifiedEmailIsExpiredForRemoval = async () => {
  const age = await getVerifiedEmailAge()
  const minutes = age / (1000 * 60)
  return minutes > 25
}
