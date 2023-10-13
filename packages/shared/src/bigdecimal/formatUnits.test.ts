import { formatUnits } from "./formatUnits"

describe("formatUnits function", () => {
  test("Should return string version of a value when decimals are 0", () => {
    expect(formatUnits(123456789n, 0)).toBe("123456789")
    expect(formatUnits(-123456789n, 0)).toBe("-123456789")
  })

  test("Should handle negative values correctly", () => {
    expect(formatUnits(-123456789n, 2)).toBe("-1234567.89")
    expect(formatUnits(-100n, 2)).toBe("-1")
  })

  test("Should format value correctly when decimals are not 0", () => {
    expect(formatUnits(123456789n, 2)).toBe("1234567.89")
    expect(formatUnits(123456789n, 3)).toBe("123456.789")
    expect(formatUnits(123456789n, 4)).toBe("12345.6789")
  })

  test("Should correctly pad and format the value", () => {
    expect(formatUnits(5n, 4)).toBe("0.0005")
    expect(formatUnits(50n, 4)).toBe("0.005")
    expect(formatUnits(500n, 4)).toBe("0.05")
    expect(formatUnits(5000n, 4)).toBe("0.5")
  })

  test("Should correctly handle values with trailing zeros", () => {
    expect(formatUnits(100n, 2)).toBe("1")
    expect(formatUnits(10000n, 4)).toBe("1")
  })
})
