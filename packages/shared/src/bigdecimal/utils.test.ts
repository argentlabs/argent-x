import {
  formatEther,
  parseEther,
  formatCurrency,
  parseCurrency,
  absBigInt,
  parseCurrencyAbs,
} from "./utils"

describe("Utility functions", () => {
  test("formatEther function should correctly format BigInt to ether string", () => {
    expect(formatEther(1000000000000000000n)).toBe("1")
    expect(formatEther(1234567890000000000n)).toBe("1.23456789")
    expect(formatEther(-1000000000000000000n)).toBe("-1")
  })

  test("parseEther function should correctly parse ether string to BigInt", () => {
    expect(parseEther("1")).toBe(1000000000000000000n)
    expect(parseEther("1.23456789")).toBe(1234567890000000000n)
    expect(parseEther("-1")).toBe(-1000000000000000000n)
  })

  test("formatCurrency function should correctly format BigInt to currency string", () => {
    expect(formatCurrency(1000000n)).toBe("1")
    expect(formatCurrency(1234567n)).toBe("1.234567")
    expect(formatCurrency(-1000000n)).toBe("-1")
  })

  test("parseCurrency function should correctly parse currency string to BigInt", () => {
    expect(parseCurrency("1")).toBe(1000000n)
    expect(parseCurrency("1.234567")).toBe(1234567n)
    expect(parseCurrency("-1")).toBe(-1000000n)
  })

  test("absBigInt function should return absolute value of BigInt", () => {
    expect(absBigInt(1000000n)).toBe(1000000n)
    expect(absBigInt(-1000000n)).toBe(1000000n)
    expect(absBigInt(0n)).toBe(0n)
  })

  test("parseCurrencyAbs function should return absolute value of parsed currency string", () => {
    expect(parseCurrencyAbs("1")).toBe(1000000n)
    expect(parseCurrencyAbs("1.234567")).toBe(1234567n)
    expect(parseCurrencyAbs("-1")).toBe(1000000n)
  })
})
