import { formatUnits } from "./formatUnits"

describe("formatUnits function", () => {
  test("Should return string version of a value when decimals are 0", () => {
    expect(formatUnits({ value: 123456789n, decimals: 0 })).toBe("123456789")
    expect(formatUnits({ value: -123456789n, decimals: 0 })).toBe("-123456789")
  })

  test("Should handle negative values correctly", () => {
    expect(formatUnits({ value: -123456789n, decimals: 2 })).toBe("-1234567.89")
    expect(formatUnits({ value: -100n, decimals: 2 })).toBe("-1")
  })

  test("Should format value correctly when decimals are not 0", () => {
    expect(formatUnits({ value: 123456789n, decimals: 2 })).toBe("1234567.89")
    expect(formatUnits({ value: 123456789n, decimals: 3 })).toBe("123456.789")
    expect(formatUnits({ value: 123456789n, decimals: 4 })).toBe("12345.6789")
  })

  test("Should correctly pad and format the value", () => {
    expect(formatUnits({ value: 5n, decimals: 4 })).toBe("0.0005")
    expect(formatUnits({ value: 50n, decimals: 4 })).toBe("0.005")
    expect(formatUnits({ value: 500n, decimals: 4 })).toBe("0.05")
    expect(formatUnits({ value: 5000n, decimals: 4 })).toBe("0.5")
  })

  test("Should correctly handle values with trailing zeros", () => {
    expect(formatUnits({ value: 100n, decimals: 2 })).toBe("1")
    expect(formatUnits({ value: 10000n, decimals: 4 })).toBe("1")
  })
})
