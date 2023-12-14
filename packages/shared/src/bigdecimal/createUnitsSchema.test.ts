import { createUnitsSchema } from "./createUnitsSchema"
import { z } from "zod"

describe("createUnitsSchema", () => {
  const schemaFor2Decimals = createUnitsSchema(2)

  it("should allow valid number formats", () => {
    test.each([
      "123",
      "-123",
      "123.45",
      "-123.45",
      "0.45",
      "-0.45",
      "0.000000000001",
    ])(`%s`, (input) => {
      expect(() => schemaFor2Decimals.parse(input)).not.toThrow()
    })
  })

  it("should reject invalid number formats", () => {
    test.each([
      "123..",
      "-123..45",
      "abc",
      "123.abc",
      "123.",
      ".123",
      "-.123",
      "--123",
    ])(`%s`, (input) => {
      expect(() => schemaFor2Decimals.parse(input)).toThrow(z.ZodError)

      const result = schemaFor2Decimals.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toEqual("Invalid number format")
      }
    })
  })

  it("should transform correctly using parseUnits", () => {
    expect(schemaFor2Decimals.parse("123.4567").value).toBe(BigInt("12346"))
    expect(schemaFor2Decimals.parse("123.4512").value).toBe(BigInt("12345"))
    expect(schemaFor2Decimals.parse("-123.4567").value).toBe(BigInt("-12346"))
  })
})
