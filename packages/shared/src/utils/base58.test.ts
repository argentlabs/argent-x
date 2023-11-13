import { test } from "vitest"
import {
  encodeBase58,
  encodeBase58Array,
  decodeBase58,
  decodeBase58Array,
} from "./base58"

test("encodeBase58", () => {
  const val = 12n
  expect(encodeBase58(val)).toMatchInlineSnapshot('"D"')
  const bigVal = BigInt(Number.MAX_SAFE_INTEGER)
  expect(encodeBase58(bigVal)).toMatchInlineSnapshot('"2DLNrMSKug"')
  expect(() => encodeBase58(-1n)).toThrow()
  expect(encodeBase58(0n)).toMatchInlineSnapshot('"1"')
})

test("encodeBase58Array", () => {
  const arr = [12n, 15n, 18n]
  expect(encodeBase58Array(arr)).toMatchInlineSnapshot(`
    [
      "D",
      "G",
      "K",
    ]
  `)
  const bigArr = [BigInt(Number.MAX_SAFE_INTEGER), 0n, -1n]
  expect(() => encodeBase58Array(bigArr)).toThrow()
})

test("decodeBase58", () => {
  const val = "D"
  expect(decodeBase58(val)).toMatchInlineSnapshot('"0x0c"')
  const bigVal = "1AVQH8GD6PWRMKGZ6JPZLR8HVGF1P8ZZZ"
  expect(decodeBase58(bigVal)).toMatchInlineSnapshot(
    '"0x0001cb73b00deccc9252827587d5641cc7535d2d88eb7f1f58"',
  )
  expect(() => decodeBase58("-1")).toThrow()
  expect(() => decodeBase58("0")).toThrow()
})

test("decodeBase58Array", () => {
  const arr = ["D", "G", "K"]
  expect(decodeBase58Array(arr)).toMatchInlineSnapshot(`
    [
      "0x0c",
      "0x0f",
      "0x12",
    ]
  `)
  const bigArr = ["1AVQH8GD6PWRMKGZ6JPZLR8HVGF1P8ZZZ", "0", "-1"]
  expect(() => decodeBase58Array(bigArr)).toThrow()
})
