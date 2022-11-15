import { getStarkKey, utils } from "micro-starknet"

export interface Keypair {
  publicKey: string
  privateKey: string
}

export const getNewStarkKeypair = async (): Promise<Keypair> => {
  const privateKey = utils.randomPrivateKey()
  const publicKey = getStarkKey(privateKey)

  return {
    publicKey,
    privateKey: utils.bytesToHex(privateKey),
  }
}
