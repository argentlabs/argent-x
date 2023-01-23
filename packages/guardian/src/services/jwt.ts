import {
  SignJWT,
  calculateJwkThumbprint,
  exportJWK,
  generateKeyPair,
} from "jose"

import type { Device } from "./idb"
import { idb } from "./idb"

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

export const resetDevice = async () => {
  await idb.transaction("rw", idb.devices, async () => {
    await idb.devices.delete(0)
    device = null
  })
}

export const getJwt = async () => {
  const { signingKey } = await getDevice()

  const time = Math.round((Date.now() - 1000) / 1000)
  const kid = await calculateJwkThumbprint(
    await exportJWK(signingKey.publicKey),
  )

  return await new SignJWT({})
    .setProtectedHeader({
      alg: "ES256",
      jwk: await exportJWK(signingKey.publicKey),
      kid,
    })
    .setIssuedAt(time)
    .setIssuer(`kid:${kid}`)
    .setExpirationTime(time + 60_000)
    .sign(signingKey.privateKey)
}
