import { number } from "starknet"

import {
  convertTokenBalanceToPrice,
  countDecimals,
  formatTokenBalance,
} from "../src/ui/features/accountTokens/tokens.service"

describe("format token balance", () => {
  test("should format token balance correctly", () => {
    expect(formatTokenBalance("0", 18)).toBe("0.0")
    expect(formatTokenBalance("1", 18)).toBe("0.0")
    expect(formatTokenBalance("456000000000", 18)).toBe("0.0000004")
    expect(formatTokenBalance("45600000000000", 18)).toBe("0.0000456")
    expect(formatTokenBalance("10000000000000000", 18)).toBe("0.01")
    expect(formatTokenBalance("1000000000000000001", 18)).toBe("1.0")
    expect(formatTokenBalance("1001000000000000000", 18)).toBe("1.001")
    expect(formatTokenBalance("1234567890123456789", 18)).toBe("1.2345678")
    expect(formatTokenBalance("111234567890123456789", 18)).toBe("111.23456")
    expect(formatTokenBalance("3222111234567890123456789", 18)).toBe(
      "3222111.2",
    )
    expect(formatTokenBalance("43222111234567890123456789", 18)).toBe(
      "43222111",
    )
    expect(formatTokenBalance("99943222111234567890123456789", 18)).toBe(
      "99943222111",
    )
  })
})

describe("countDecimals()", () => {
  test("should count decimal places correctly", () => {
    expect(countDecimals(1)).toEqual(0)
    expect(countDecimals(1.12)).toEqual(2)
    expect(countDecimals(1.1234)).toEqual(4)
    expect(countDecimals(1.123456789)).toEqual(9)
    /** strips the final 0 correctly */
    expect(countDecimals("1.1234567890")).toEqual(9)
  })
})

describe("convertTokenBalanceToPrice()", () => {
  test("should convert token balance to price correctly", () => {
    expect(
      /** decimals may be of type BN in the wild */
      convertTokenBalanceToPrice({
        balance: "1000000000000000000",
        decimals: number.toBN(18, 10),
        price: 1.23,
      }),
    ).toEqual("1.23")
    expect(
      convertTokenBalanceToPrice({
        balance: "1000000000000000000",
        decimals: 18,
        price: "1032.296954",
      }),
    ).toEqual("1032.296954")
    expect(
      convertTokenBalanceToPrice({
        balance: "20000000000000",
        decimals: 13,
        price: "1032.296954",
      }),
    ).toEqual("2064.593908")
    expect(
      convertTokenBalanceToPrice({
        balance: "30000000000",
        decimals: 10,
        price: "1032.296954",
      }),
    ).toEqual("3096.890862")
  })
})
