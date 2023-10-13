import { pubkeySchema } from "./useCreateMultisigForm"

describe("pubkeySchema", () => {
  it("should validate a string of 41 to 43 alphanumeric characters", () => {
    const validInput1 = "aA1234567890bB1234567890cC1234567890dD123"
    const validInput2 = "aA1234567890bB1234567890cC1234567890dD12345"

    expect(() => pubkeySchema.parse(validInput1)).not.toThrow()
    expect(() => pubkeySchema.parse(validInput2)).not.toThrow()
  })

  it("should not validate a string of less than 41 or more than 43 characters", () => {
    const shortInput = "aA12345"
    const longInput = "aA1234567890bB1234567890cC1234567890dD123456"

    expect(() => pubkeySchema.parse(shortInput)).toThrow(
      "Incorrect signer pubkey",
    )
    expect(() => pubkeySchema.parse(longInput)).toThrow(
      "Incorrect signer pubkey",
    )
  })

  it("should not validate a string with non-alphanumeric characters", () => {
    const invalidInput = "aA1234567890bB!@34567890cC1234567890dD12345"

    expect(() => pubkeySchema.parse(invalidInput)).toThrow(
      "Incorrect signer pubkey",
    )
  })

  it("should not validate non-string inputs", () => {
    expect(() => pubkeySchema.parse(12345678901234560)).toThrow()
    expect(() => pubkeySchema.parse({})).toThrow()
    expect(() => pubkeySchema.parse([])).toThrow()
    expect(() => pubkeySchema.parse(null)).toThrow()
    expect(() => pubkeySchema.parse(undefined)).toThrow()
  })
})
