import { BigDecimal } from "./types"

export const toFixedDecimals = (
  amount: BigDecimal,
  decimals: number,
): BigDecimal => ({
  decimals: decimals,
  value:
    decimals >= amount.decimals
      ? amount.value * BigInt(10) ** BigInt(decimals - amount.decimals)
      : amount.value / BigInt(10) ** BigInt(amount.decimals - decimals),
})

export const toTiniestPossibleDecimal = (amount: BigDecimal): BigDecimal => {
  const decimalsReduction = amount.value
    .toString()
    .split("")
    .reverse()
    .reduce((acc, char) => (char === "0" ? acc + 1 : acc), 0)
  return toFixedDecimals(amount, amount.decimals - decimalsReduction)
}

const getAdjustedValues = (
  a: BigDecimal,
  b: BigDecimal,
): [bigint, bigint, number] => {
  const decimals = Math.max(a.decimals, b.decimals)
  const [adjustedA, adjustedB] = [a, b].map((amount) =>
    toFixedDecimals(amount, decimals),
  )
  return [adjustedA.value, adjustedB.value, decimals]
}

type ArithmeticOpCallback = (a: bigint, b: bigint, decimals: number) => bigint

const arithmeticOp =
  (op: ArithmeticOpCallback) =>
  (a: BigDecimal, b: BigDecimal): BigDecimal => {
    const [adjustedA, adjustedB, decimals] = getAdjustedValues(a, b)
    return {
      decimals,
      value: op(adjustedA, adjustedB, decimals),
    }
  }

type CompareOpCallback = (a: bigint, b: bigint) => boolean

const compareOp =
  (op: CompareOpCallback) =>
  (a: BigDecimal, b: BigDecimal): boolean => {
    const [adjustedA, adjustedB] = getAdjustedValues(a, b)
    return op(adjustedA, adjustedB)
  }

// arithmetic: add, sub, mul, div, mod, abs
export const add = arithmeticOp((a, b) => a + b)
export const sub = arithmeticOp((a, b) => a - b)
export const div = arithmeticOp((a, b, decimals) => {
  if (b === BigInt(0)) {
    throw new Error("Division by zero is not allowed")
  }
  return (a * BigInt(10) ** BigInt(decimals)) / b
})
export const mul = (a: BigDecimal, b: BigDecimal): BigDecimal =>
  toTiniestPossibleDecimal({
    decimals: a.decimals + b.decimals,
    value: a.value * b.value,
  })
export const mod = arithmeticOp((a, b) => {
  if (b === BigInt(0)) {
    throw new Error("Modulus by zero is not allowed")
  }
  return a % b
})
export const abs = (amount: BigDecimal): BigDecimal => ({
  decimals: amount.decimals,
  value: amount.value >= BigInt(0) ? amount.value : -amount.value,
})

// compare: eq, lt, gt, lte, gte, not
export const eq = compareOp((a, b) => a === b)
export const lt = compareOp((a, b) => a < b)
export const gt = compareOp((a, b) => a > b)
export const lte = compareOp((a, b) => a <= b)
export const gte = compareOp((a, b) => a >= b)
export const not = (a: BigDecimal, b: BigDecimal): boolean => !eq(a, b)
