import {
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

createDevice().then(async (d) => {
  if (typeof d.signingKey === "string") {
    throw new Error("Signing key is not a key object")
  }
  const jwk = await exportJWK(d.signingKey.publicKey)
  const thumbprint = await calculateJwkThumbprint(jwk)
  const jwt = await new SignJWT({ foo: "bar" })
    .setIssuer("https://example.com")
    .setAudience("https://example.com")
    .setProtectedHeader({
      alg: "ES256",
      jwk: { ...jwk },
      kid: thumbprint,
    })
    .sign(d.signingKey.privateKey)

  console.log(jwt)
})

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
