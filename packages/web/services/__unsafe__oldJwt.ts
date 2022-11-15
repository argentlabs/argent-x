import { base64url, stringToBytes } from "@scure/base"
import { Wallet, utils } from "ethers"
import { generateKeyPair } from "jose"

import { Device, idb } from "./idb"
import { genKeyPairOpts } from "./jwt"

let device: Device

const createDevice = async (): Promise<Device> => {
  const newWallet = Wallet.createRandom()
  const signingKey = newWallet.privateKey

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

export const getJwt = async () => {
  const device = await getDevice()

  if (!(typeof device.signingKey === "string")) {
    throw new Error("device signing key is not a string")
  }

  const wallet = new Wallet(device.signingKey)
  const time = Math.round((Date.now() - 1000) / 1000)
  const jwt = await argentJwt({ time, owner: wallet })
  return jwt
}

// !!!
// oh god, please dont touch the code below this line

const argentJwt = async ({
  time,
  validity = 60000,
  owner,
}: {
  time: number
  validity?: number
  owner: Wallet
}) => {
  const header = {
    alg: "ES256k",
    typ: "ethJWT",
  }

  const payload = {
    iss: owner.address.toLowerCase(),
    exp: time + validity,
    iat: time,
  }

  const encoded = [header, payload]
    .map((input) =>
      base64url.encode(stringToBytes("utf8", JSON.stringify(input))),
    )
    .join(".")

  const message = "0x" + Buffer.from(encoded).toString("hex")

  const rawSignature = await owner.signMessage(utils.arrayify(message))
  const signature = utils.splitSignature(rawSignature)
  const formattedSignature = [
    signature.v.toString(16),
    signature.r.substring(2),
    signature.s.substring(2),
  ].join("_")

  const jwt = [
    encoded,
    base64url.encode(stringToBytes("utf8", formattedSignature)),
  ].join(".")

  return jwt
}
