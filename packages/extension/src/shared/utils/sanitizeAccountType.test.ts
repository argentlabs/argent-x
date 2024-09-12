import { sanitizeAccountType } from "./sanitizeAccountType"
import { ArgentAccountType } from "../wallet.model"

describe("sanitizeAccountType", () => {
  test.each(["standard", "multisig", "smart"])(
    "should return account type, given a type in the white list",
    (type) => {
      expect(sanitizeAccountType(type as ArgentAccountType)).toBe(type)
    },
  )

  test.each([
    "plugin",
    "betterMulticall",
    "argent5MinuteEscapeTestingAccount",
    "standardCairo0",
  ])(
    "should return standard type, given a type not in the white list",
    (type) => {
      expect(sanitizeAccountType(type as ArgentAccountType)).toBe("standard")
    },
  )

  test("should return standard type, given undefined", () => {
    expect(sanitizeAccountType(undefined)).toBe("standard")
  })
})
