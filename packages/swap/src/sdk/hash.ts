import {
  computeHashOnElements as micro_computeHashOnElements,
  pedersen as micro_pedersen,
} from "micro-starknet"
import { RawCalldata, number } from "starknet"

export type PedersenArg = number | string

export function pedersen(input: [PedersenArg, PedersenArg]) {
  return micro_pedersen(...input)
}

export function computeHashOnElements(data: number.BigNumberish[]) {
  const hexData = data.map((d) => number.toHex(number.toBigInt(d)))

  return micro_computeHashOnElements(hexData).toString(16)
}

export function calculateContractAddressFromHash(
  salt: number.BigNumberish,
  classHash: number.BigNumberish,
  constructorCalldata: RawCalldata,
  deployerAddress: number.BigNumberish,
) {
  const constructorCalldataHash = computeHashOnElements(constructorCalldata)

  const CONTRACT_ADDRESS_PREFIX = number.toFelt(
    "0x535441524b4e45545f434f4e54524143545f41444452455353",
  ) // Equivalent to 'STARKNET_CONTRACT_ADDRESS'

  const dataToHash = [
    CONTRACT_ADDRESS_PREFIX,
    deployerAddress,
    salt,
    classHash,
    constructorCalldataHash,
  ]

  return computeHashOnElements(dataToHash)
}
