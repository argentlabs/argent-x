import { Hex, bytesToHex, hexToBytes } from "@noble/curves/abstract/utils"
import { sha256 } from "@noble/hashes/sha256"
import { HDKey } from "@scure/bip32"
import { isNumber } from "lodash-es"
import { ec, encode, number } from "starknet"

const { addHexPrefix } = encode

export function getStarkPair<T extends number | string>(
  indexOrPath: T,
  secret: string,
  ...[baseDerivationPath]: T extends string ? [] : [string]
): { pubKey: string; getPrivateKey: () => string } {
  const hex = number.toBigInt(secret).toString(16)
  const masterNode = HDKey.fromMasterSeed(hexToBytes(hex))

  // baseDerivationPath will never be undefined because of the extends statement below,
  // but somehow TS doesnt get this. As this will be removed in the near future I didnt bother
  const path: string = isNumber(indexOrPath)
    ? getPathForIndex(indexOrPath, baseDerivationPath ?? "")
    : indexOrPath
  const childNode = masterNode.derive(path)

  if (!childNode.privateKey) {
    throw "childNode.privateKey is undefined"
  }

  const groundKey = addHexPrefix(grindKey(childNode.privateKey))
  return {
    pubKey: ec.starkCurve.getStarkKey(groundKey),
    getPrivateKey: () => groundKey,
  }
}

export function grindKey(privateKey: Hex): string {
  return ec.starkCurve.grindKey(privateKey)
}

export function getPathForIndex(
  index: number,
  baseDerivationPath: string,
): string {
  return `${baseDerivationPath}/${index}`
}

export function getIndexForPath(path: string, baseDerivationPath: string) {
  if (!path.startsWith(baseDerivationPath)) {
    throw "path should begin with baseDerivationPath"
  }
  const index = path.substring(path.lastIndexOf("/") + 1)
  return parseInt(index)
}

export function getNextPathIndex(
  paths: string[],
  baseDerivationPath: string,
): number {
  for (let index = 0; index < paths.length; index++) {
    if (!paths.includes(getPathForIndex(index, baseDerivationPath))) {
      return index
    }
  }
  return paths.length
}

export function pathHash(name: string): number {
  const bigHash = BigInt.asUintN(
    31,
    BigInt(addHexPrefix(bytesToHex(sha256(name)))),
  )

  return Number(bigHash)
}
