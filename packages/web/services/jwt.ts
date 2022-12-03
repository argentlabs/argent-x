import {
  JWK,
  SignJWT,
  calculateJwkThumbprint,
  exportJWK,
  generateKeyPair,
} from "jose"

import { Device, idb } from "./idb"

let device: Device

export const genKeyPairOpts = Object.freeze({ extractable: false }) // important that it stays non-extractable

const createDevice = async (): Promise<Device> => {
  const signingKey = await generateKeyPair("ES256", genKeyPairOpts)

  const encryptionKey = await generateKeyPair("ECDH-ES+A256KW", genKeyPairOpts)

  return {
    id: 0,
    signingKey,
    encryptionKey,
  }
}

export const getDevice = async () => {
  if (!device) {
    const newDevice = await createDevice()

    device = await idb.transaction("rw", idb.devices, async () => {
      const device = await idb.devices.get(0)
      if (device) {
        return device
      }
      await idb.devices.add(newDevice)
      return newDevice
    })
  }

  return device
}
