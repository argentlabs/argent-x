import { idb } from "./idb"
import { getDevice } from "./jwt"
import { smartAccountService } from "."

export const updateVerifiedEmail = async (email?: string) => {
  let device = null
  await idb.transaction("rw", idb.devices, async () => {
    device = await getDevice()
    device.verifiedEmail = email
    device.verifiedAt = new Date().toISOString()
    await idb.devices.put(device)
  })
  if (device) {
    await smartAccountService.handleDeviceUpdate(device)
  }
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
  throw new Error("Smart Account email not verified")
}

/** for guardian removal, have user authenticated within last 5 minutes */

export const getVerifiedEmailIsExpiredForRemoval = async () => {
  const age = await getVerifiedEmailAge()
  const minutes = age / (1000 * 60)
  return minutes > 5
}
