import { BigNumber, BigNumberish, utils } from "ethers"
import { isNumber } from "lodash-es"
import { KeyPair, ec, number } from "starknet"

export function getStarkPair<T extends number | string>(
  indexOrPath: T,
  secret: BigNumberish,
  ...[baseDerivationPath]: T extends string ? [] : [string]
): KeyPair {
  const masterNode = utils.HDNode.fromSeed(BigNumber.from(secret).toHexString())

  // baseDerivationPath will never be undefined because of the extends statement below,
  // but somehow TS doesnt get this. As this will be removed in the near future I didnt bother
  const path: string = isNumber(indexOrPath)
    ? getPathForIndex(indexOrPath, baseDerivationPath ?? "")
    : indexOrPath
  const childNode = masterNode.derivePath(path)
  const groundKey = grindKey(childNode.privateKey)
  const starkPair = ec.getKeyPair(groundKey)
  return starkPair
}

export function getPathForIndex(
  index: number,
  baseDerivationPath: string,
): string {
  return `${baseDerivationPath}/${index}`
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

// inspired/copied from https://github.com/authereum/starkware-monorepo/blob/51c5df19e7f98399a2f7e63d564210d761d138d1/packages/starkware-crypto/src/keyDerivation.ts#L85
export function grindKey(keySeed: string): string {
  const keyValueLimit = ec.ec.n
  if (!keyValueLimit) {
    return keySeed
  }
  const sha256EcMaxDigest = number.toBN(
    "1 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000",
    16,
  )
  const maxAllowedVal = sha256EcMaxDigest.sub(
    sha256EcMaxDigest.mod(keyValueLimit),
  )

  // Make sure the produced key is devided by the Stark EC order,
  // and falls within the range [0, maxAllowedVal).
  let i = 0
  let key
  do {
    key = hashKeyWithIndex(keySeed, i)
    i++
  } while (!key.lt(maxAllowedVal))

  return "0x" + key.umod(keyValueLimit).toString("hex")
}

function hashKeyWithIndex(key: string, index: number) {
  const payload = utils.concat([utils.arrayify(key), utils.arrayify(index)])
  const hash = utils.sha256(payload)
  return number.toBN(hash)
}

export function pathHash(name: string): number {
  return number
    .toBN(utils.sha256(utils.toUtf8Bytes(name)))
    .maskn(31)
    .toNumber()
}
