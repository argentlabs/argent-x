import { describe, expect, test } from "vitest"

import { formatTokenBalance } from "../src/ui/services/tokens/utils"

const DEFAULT_TOKEN_LENGTH = 9
describe("format token balance", () => {
  test("should format token balance correctly", () => {
    expect(formatTokenBalance(DEFAULT_TOKEN_LENGTH, "0", 18)).toBe("0.0")
    expect(formatTokenBalance(DEFAULT_TOKEN_LENGTH, "1", 18)).toBe("0.0")
    expect(formatTokenBalance(DEFAULT_TOKEN_LENGTH, "456000000000", 18)).toBe(
      "0.0000004",
    )
    expect(formatTokenBalance(DEFAULT_TOKEN_LENGTH, "45600000000000", 18)).toBe(
      "0.0000456",
    )
    expect(
      formatTokenBalance(DEFAULT_TOKEN_LENGTH, "10000000000000000", 18),
    ).toBe("0.01")
    expect(
      formatTokenBalance(DEFAULT_TOKEN_LENGTH, "1000000000000000001", 18),
    ).toBe("1.0")
    expect(
      formatTokenBalance(DEFAULT_TOKEN_LENGTH, "1001000000000000000", 18),
    ).toBe("1.001")
    expect(
      formatTokenBalance(DEFAULT_TOKEN_LENGTH, "1234567890123456789", 18),
    ).toBe("1.2345678")
    expect(
      formatTokenBalance(DEFAULT_TOKEN_LENGTH, "111234567890123456789", 18),
    ).toBe("111.23456")
    expect(
      formatTokenBalance(DEFAULT_TOKEN_LENGTH, "3222111234567890123456789", 18),
    ).toBe("3222111.2")
    expect(
      formatTokenBalance(
        DEFAULT_TOKEN_LENGTH,
        "43222111234567890123456789",
        18,
      ),
    ).toBe("43222111")
    expect(
      formatTokenBalance(
        DEFAULT_TOKEN_LENGTH,
        "99943222111234567890123456789",
        18,
      ),
    ).toBe("99943222111")
  })
})
