import { Wallet } from "ethers"
import {
  JWK,
  SignJWT,
  calculateJwkThumbprint,
  exportJWK,
  generateKeyPair,
} from "jose"

import { Device, idb } from "./idb"

/** TODO: align approach - originally copied from packages/web */

export const genKeyPairOpts = Object.freeze({ extractable: false }) // important that it stays non-extractable

const createDevice = async (): Promise<Device> => {
  // generate this and store in storage (persistent across refreshes)
  // used to sign JWT,
  // does not need to be encypted at rest
  // store in indexeddb, not 'extractable' from browsr

  // currently we are always registering a device as they never get deleted

  // backend only has one valid jwt

  // you can use any 'read' endpoint to check if your session is still valid

  // const signingKey = await generateKeyPair("ES256", genKeyPairOpts)

  // TODO: use the new method above when working
  console.warn(
    "TODO: Using legacy jwt signing - replace with new implementation",
  )
  const newWallet = Wallet.createRandom()
  const signingKey = newWallet.privateKey

  return {
    id: 0,
    signingKey,
  }
}

// createDevice().then(async (d) => {
//   if (typeof d.signingKey === "string") {
//     throw new Error("Signing key is not a key object")
//   }
//   const jwk = await exportJWK(d.signingKey.publicKey)
//   const thumbprint = await calculateJwkThumbprint(jwk)
//   const jwt = await new SignJWT({ foo: "bar" })
//     .setIssuer("https://example.com")
//     .setAudience("https://example.com")
//     .setProtectedHeader({
//       alg: "ES256",
//       jwk: { ...jwk, kid: thumbprint } as JWK,
//       kid: thumbprint,
//     })
//     .sign(d.signingKey.privateKey)

//   console.log(jwt)
// })

let device: Device | null = null

export const resetDevice = async () => {
  await idb.transaction("rw", idb.devices, async () => {
    await idb.devices.delete(0)
    device = null
  })
}

export const getDevice = async () => {
  if (!device) {
    const newDevice = await createDevice()

    device = await idb.transaction("rw", idb.devices, async () => {
      const device = await idb.devices.get(0)
      if (device) {
        return device
      }
      await idb.devices.put(newDevice)
      return newDevice
    })
  }

  return device
}

export const updateVerifiedEmail = async (email?: string) => {
  if (device === null) {
    device = await getDevice()
  }
  await idb.transaction("rw", idb.devices, async () => {
    const device = await idb.devices.get(0)
    if (device) {
      device.verifiedEmail = email
      device.verifiedAt = new Date().toISOString()
      await idb.devices.put(device)
    }
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
