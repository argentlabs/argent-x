import { parseUnits } from "./parseUnits"

describe("parseUnits function", () => {
  test("Should correctly parse string value to BigInt", () => {
    expect(parseUnits("1234567.89", 2).value).toBe(123456789n)
    expect(parseUnits("123456.789", 3).value).toBe(123456789n)
    expect(parseUnits("12345.6789", 4).value).toBe(123456789n)
  })

  test("Should handle negative values correctly", () => {
    expect(parseUnits("-1234567.89", 2).value).toBe(-123456789n)
    expect(parseUnits("-1", 2).value).toBe(-100n)
  })

  test("Should correctly handle values with insufficient fraction digits", () => {
    expect(parseUnits("0.0005", 4).value).toBe(5n)
    expect(parseUnits("0.005", 4).value).toBe(50n)
    expect(parseUnits("0.05", 4).value).toBe(500n)
    expect(parseUnits("0.5", 4).value).toBe(5000n)
  })

  test("Should correctly round-off fractions longer than the specified decimals", () => {
    expect(parseUnits("1.00005", 4).value).toBe(10001n)
    expect(parseUnits("1.00004", 4).value).toBe(10000n)
    expect(parseUnits("1.000049", 5).value).toBe(100005n)
    expect(parseUnits("1.000050", 5).value).toBe(100005n)
    expect(parseUnits("1.000499", 6).value).toBe(1000499n)
    expect(parseUnits("1.000500", 6).value).toBe(1000500n)
    expect(parseUnits("1.1234567890", 9).value).toBe(1123456789n)
    expect(parseUnits("-1.00005", 4).value).toBe(-10001n)
    expect(parseUnits("-1.00004", 4).value).toBe(-10000n)
    expect(parseUnits("-1.000049", 5).value).toBe(-100005n)
    expect(parseUnits("-1.000050", 5).value).toBe(-100005n)
    expect(parseUnits("-1.000499", 6).value).toBe(-1000499n)
    expect(parseUnits("-1.000500", 6).value).toBe(-1000500n)
    expect(parseUnits("-1.1234567890", 9).value).toBe(-1123456789n)
  })

  test("Should correctly pad the fraction part", () => {
    expect(parseUnits("1", 2).value).toBe(100n)
    expect(parseUnits("1", 4).value).toBe(10000n)
  })
})
