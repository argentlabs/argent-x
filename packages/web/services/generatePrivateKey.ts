import { getStarkKey, utils } from "micro-starknet"
import { encode } from "starknet"

export interface Keypair {
  publicKey: string
  privateKey: string
}

export const getNewStarkKeypair = async (): Promise<Keypair> => {
  const privateKey = utils.randomPrivateKey()
  const publicKey = encode.addHexPrefix(
    encode.removeHexPrefix(getStarkKey(privateKey)).padStart(64, "0"),
  )

  return {
    publicKey,
    privateKey: encode.addHexPrefix(utils.bytesToHex(privateKey)),
  }
}
