import {
  SignJWT,
  calculateJwkThumbprint,
  exportJWK,
  generateKeyPair,
} from "jose"

import { Device, idb } from "./idb"

/** important that signingKey stays not 'extractable' from browser */

const alg = "ES256"
const genKeyPairOpts = Object.freeze({ extractable: false })

const createDevice = async (): Promise<Device> => {
  const signingKey = await generateKeyPair(alg, genKeyPairOpts)
  return {
    id: 0,
    signingKey,
  }
}

let _device: Device | null = null

export const resetDevice = async () => {
  await idb.transaction("rw", idb.devices, async () => {
    await idb.devices.delete(0)
    _device = null
  })
}

export const getDevice = async () => {
  if (!_device) {
    const newDevice = await createDevice()
    _device = await idb.transaction("rw", idb.devices, async () => {
      const device = await idb.devices.get(0)
      if (device) {
        return device
      }
      await idb.devices.put(newDevice)
      return newDevice
    })
  }
  return _device
}

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
  throw new Error("Email not verified")
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

export const generateJwt = async () => {
  const device = await getDevice()
  if (typeof device.signingKey === "string") {
    throw new Error("signingKey is not a key object")
  }
  const { publicKey, privateKey } = device.signingKey

  const publicJwk = await exportJWK(publicKey)
  const thumbprint = await calculateJwkThumbprint(publicJwk)

  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg, jwk: publicJwk })
    .setIssuedAt()
    .setIssuer("kid:" + thumbprint)
    .setExpirationTime("2h")
    .sign(privateKey)

  return jwt
}
