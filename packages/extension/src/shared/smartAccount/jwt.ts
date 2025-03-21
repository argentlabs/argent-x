import type { Device } from "@argent/x-guardian"
import {
  SignJWT,
  calculateJwkThumbprint,
  exportJWK,
  generateKeyPair,
} from "jose"

import { getBackendTimeNowSeconds } from "./backend/time"
import { idb } from "./idb"
import { smartAccountService } from "."

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

export const resetDevice = async () => {
  await idb.devices.delete(0)
  await smartAccountService.handleDeviceUpdate(undefined)
}

export const getDevice = async () => {
  const device = await idb.devices.get(0)
  if (device) {
    return device
  }
  const newDevice = await createDevice()
  await idb.devices.put(newDevice)
  await smartAccountService.handleDeviceUpdate(newDevice)
  return newDevice
}

export const generateJwt = async () => {
  const device = await getDevice()
  if (typeof device.signingKey === "string") {
    throw new Error("signingKey is not a key object")
  }
  const { publicKey, privateKey } = device.signingKey

  const publicJwk = await exportJWK(publicKey)
  const thumbprint = await calculateJwkThumbprint(publicJwk)

  /** set issuer time from backend in case of discrepancy with local machine time */
  const backendTimeNowSeconds = await getBackendTimeNowSeconds()

  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg, jwk: publicJwk })
    .setIssuedAt(backendTimeNowSeconds)
    .setIssuer("kid:" + thumbprint)
    .setExpirationTime(backendTimeNowSeconds + 5 * 60.0)
    .sign(privateKey)

  return jwt
}
