import { describe, expect, test } from "vitest"

import { anonymizeUserAgent } from "../src/shared/analytics"

describe("anonymizeUseragent()", () => {
  test("should return unknown if empty", () => {
    expect(anonymizeUserAgent("")).toBe("unknown")
  })
  test("should return same string if no version found", () => {
    expect(anonymizeUserAgent("Chrome")).toBe("Chrome")
  })
  test("should work with real world ua", () => {
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36"
    const anonymized = anonymizeUserAgent(ua)
    expect(anonymized).toMatchInlineSnapshot(
      `"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0 Safari/537.36"`,
    )
  })
})
