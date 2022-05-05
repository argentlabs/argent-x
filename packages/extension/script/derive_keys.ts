import readline from "readline"

import { ethers } from "ethers"
import { ec, encode } from "starknet"

import { getStarkPair } from "../src/background/keys/keyDerivation"

const { sanitizeBytes, addHexPrefix } = encode

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const ethersWallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC as string)

for (let index = 0; index < 10; index++) {
  const starkPair = getStarkPair(index, ethersWallet.privateKey)
  const starKey = ec.getStarkKey(starkPair)

  console.log(index, starKey)
}

rl.question("Index? ", (answer) => {
  const index = parseInt(answer, 10)
  const starkPair = getStarkPair(index, ethersWallet.privateKey)
  const starKey = ec.getStarkKey(starkPair)
  const privateKey = addHexPrefix(sanitizeBytes(starkPair.getPrivate("hex")))

  console.log(index, starKey, privateKey)
  rl.close()
})
