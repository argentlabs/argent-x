import { describe, it, expect } from "vitest"
import { decodeShortStringArray } from "./decodeShortStringArray"

describe("decodeShortStringArray", () => {
  it("should correctly decode an array of short strings", () => {
    const input = ["0x0", "0x4650485f446f67655f5334", "0xb"]
    const result = decodeShortStringArray(input)
    expect(result).toBe("FPH_Doge_S4")
  })

  it("should decode another array of short strings", () => {
    const input = ["0x0", "0x53344447", "0x4"]
    const result = decodeShortStringArray(input)
    expect(result).toBe("S4DG")
  })

  it("should decode a single short string", () => {
    const input = ["0x4574686572"]
    const result = decodeShortStringArray(input)
    expect(result).toBe("Ether")
  })

  it("should decode ETH short string", () => {
    const input = ["0x455448"]
    const result = decodeShortStringArray(input)
    expect(result).toBe("ETH")
  })
})
