import { BigNumber, BigNumberish, utils } from "ethers"
import { KeyPair, ec, number } from "starknet"

// from https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2645.md
// m / purpose' / layer' / application' / eth_address_1' / eth_address_2' / index
// layer = pathHash("starknet")
// application = pathHash("argentx")

const BASE_PATH = "m/2645'/1195502025'/1148870696'/0'/0'"

export function getStarkPair(
  indexOrPath: number | string,
  secret: BigNumberish,
): KeyPair {
  const masterNode = utils.HDNode.fromSeed(BigNumber.from(secret).toHexString())

  const path =
    typeof indexOrPath === "number" ? getPathForIndex(indexOrPath) : indexOrPath
  const childNode = masterNode.derivePath(path)
  const groundKey = grindKey(childNode.privateKey)
  const starkPair = ec.getKeyPair(groundKey)
  return starkPair
}

export function getPathForIndex(index: number): string {
  return `${BASE_PATH}/${index}`
}

export function getNextPathIndex(paths: string[]): number {
  for (let index = 0; index < paths.length; index++) {
    if (!paths.includes(getPathForIndex(index))) {
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
