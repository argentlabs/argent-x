import { base64url, stringToBytes } from "@scure/base"
import { Wallet, utils } from "ethers"

import { getDevice } from "./jwt"

/** TODO: align approach - originally copied from packages/web */

// backend is stateful
// e.g. in a 'session' with your device

export const getJwt = async () => {
  // always the persisted device
  const device = await getDevice()

  console.log({ device })

  if (!(typeof device.signingKey === "string")) {
    throw new Error("device signing key is not a string")
  }

  // if (typeof device.signingKey === "string") {
  //   throw new Error("Signing key is not a key object")
  // }

  // Wallet here is not analogous to the extension wallet,
  // just used as a convenience for a signing key-pair
  // the new implementation (tbc) takes a different approach, no mention of wallets
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
