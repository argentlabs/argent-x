import { ec } from "starknet"

import {
  getNextPathIndex,
  getStarkPair,
  grindKey,
  pathHash,
} from "../src/background/keys/keyDerivation"

test("generate Stark Pair", () => {
  // secret is an L1 private key (stored locally in a keystore file)
  const secret =
    "0xe6904d63affe7a13cd30345b000c9b1ffc087832332d7303cf237ffda8a177d0"

  const starkPair5 = getStarkPair(5, secret)
  expect(ec.getStarkKey(starkPair5)).toBe(
    "0x9be28603e0203db9adcac04302ba54f97f6d27abd8b801e3a80b20d25a7f21",
  )

  const starkPair7 = getStarkPair(7, secret)
  expect(ec.getStarkKey(starkPair7)).toBe(
    "0x0420c619da34e3bf4b050ddb980d81d715d90bb14ff379024845111fbf9971c2",
  )
})

test("grindKey", () => {
  const privateKey =
    "0x86F3E7293141F20A8BAFF320E8EE4ACCB9D4A4BF2B4D295E8CEE784DB46E0519"
  const res = grindKey(privateKey)
  expect(res).toBe(
    "0x5c8c8683596c732541a59e03007b2d30dbbbb873556fe65b5fb63c16688f941",
  )
})

test("pathHash", () => {
  expect(pathHash("starknet")).toBe(1195502025)
  expect(pathHash("starkex")).toBe(579218131)
  expect(pathHash("argentx")).toBe(1148870696)
})

test("getNextPathIndex", () => {
  expect(
    getNextPathIndex([
      "m/2645'/1195502025'/1148870696'/0'/0'/0",
      "m/2645'/1195502025'/1148870696'/0'/0'/1",
      "m/2645'/1195502025'/1148870696'/0'/0'/2",
    ]),
  ).toBe(3)

  expect(
    getNextPathIndex([
      "m/2645'/1195502025'/1148870696'/0'/0'/0",
      "m/2645'/1195502025'/1148870696'/0'/0'/4",
      "m/2645'/1195502025'/1148870696'/0'/0'/11",
    ]),
  ).toBe(12)

  expect(
    getNextPathIndex([
      "m/2645'/1195502025'/1148870696'/0'/0'/3",
      "m/2645'/1195502025'/1148870696'/0'/0'/1",
    ]),
  ).toBe(4)

  expect(getNextPathIndex([])).toBe(0)
})
