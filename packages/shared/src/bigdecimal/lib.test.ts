import { test } from "vitest"
import { add, sub, div, mul, mod, abs, eq, lt, gt, lte, gte, not } from "./lib"
import { BigDecimal } from "./types"

const a: BigDecimal = { value: BigInt(10), decimals: 2 }
const b: BigDecimal = { value: BigInt(5), decimals: 2 }

test("add", () => {
  const result = add(a, b)
  expect(result.value).toBe(BigInt(15))
  expect(result.decimals).toBe(2)
})

test("sub", () => {
  const result = sub(a, b)
  expect(result.value).toBe(BigInt(5))
  expect(result.decimals).toBe(2)
})

test("div", () => {
  const result = div(a, b)
  expect(result.value).toBe(BigInt(200))
  expect(result.decimals).toBe(2)
})

test("mul", () => {
  const result = mul(a, b)
  expect(result.value).toBe(BigInt(5))
  expect(result.decimals).toBe(3)
})

test("mod", () => {
  const result = mod(a, b)
  expect(result.value).toBe(BigInt(0))
  expect(result.decimals).toBe(2)
})

test("abs", () => {
  const result = abs({ ...a, value: -a.value })
  expect(result).toEqual(a)
})

test("eq", () => {
  expect(eq(a, a)).toBe(true)
  expect(eq(a, b)).toBe(false)
})

test("lt", () => {
  expect(lt(a, b)).toBe(false)
  expect(lt(b, a)).toBe(true)
})

test("gt", () => {
  expect(gt(a, b)).toBe(true)
  expect(gt(b, a)).toBe(false)
})

test("lte", () => {
  expect(lte(a, a)).toBe(true)
  expect(lte(a, b)).toBe(false)
})

test("gte", () => {
  expect(gte(a, a)).toBe(true)
  expect(gte(b, a)).toBe(false)
})

test("not", () => {
  expect(not(a, a)).toBe(false)
  expect(not(a, b)).toBe(true)
})
