import { describe, it, expect } from "vitest"

import { shouldLocalize } from "./shouldLocalize"

describe("shouldLocalize", () => {
  describe("should return false for", () => {
    it("empty strings", () => {
      expect(shouldLocalize("")).toBe(false)
      expect(shouldLocalize(" ")).toBe(false)
      expect(shouldLocalize("  ")).toBe(false)
    })

    it("strings without letters", () => {
      expect(shouldLocalize("123")).toBe(false)
      expect(shouldLocalize("!@#")).toBe(false)
      expect(shouldLocalize("12.34")).toBe(false)
      expect(shouldLocalize("/")).toBe(false)
    })

    it("strings shorter than 3 characters", () => {
      expect(shouldLocalize("a")).toBe(false)
      expect(shouldLocalize("ab")).toBe(false)
    })

    it("key-like strings", () => {
      expect(shouldLocalize("key123")).toBe(false)
      expect(shouldLocalize("key_123")).toBe(false)
      expect(shouldLocalize("fooBar")).toBe(false)
      expect(shouldLocalize("KEY_123")).toBe(false)
      expect(shouldLocalize("key-123")).toBe(false)
      expect(shouldLocalize("KEY-123")).toBe(false)
      expect(shouldLocalize("key.123")).toBe(false)
      expect(shouldLocalize("KEY.123")).toBe(false)
      expect(shouldLocalize("surface-sunken")).toBe(false)
      expect(shouldLocalize("accent-brand")).toBe(false)
      expect(shouldLocalize("accent-hot-pink")).toBe(false)
      expect(shouldLocalize("accent-yellow")).toBe(false)
      expect(shouldLocalize("accent-green")).toBe(false)
      expect(shouldLocalize("accent-sky-blue")).toBe(false)
      expect(shouldLocalize("networkStatuses-all")).toBe(false)
    })

    it("numbers", () => {
      expect(shouldLocalize("12345")).toBe(false)
      expect(shouldLocalize("0")).toBe(false)
    })

    it("dates and times", () => {
      expect(shouldLocalize("2024-03-15")).toBe(false)
      expect(shouldLocalize("15:30:45")).toBe(false)
      expect(shouldLocalize("03/15/2024")).toBe(false)
    })

    it("constants and enum-like strings", () => {
      expect(shouldLocalize("CONSTANT_NAME")).toBe(false)
      expect(shouldLocalize("ENUM_VALUE_1")).toBe(false)
    })

    it("URLs", () => {
      expect(shouldLocalize("https://example.com")).toBe(false)
      expect(shouldLocalize("http://test.org/path")).toBe(false)
    })

    it("email addresses", () => {
      expect(shouldLocalize("test@example.com")).toBe(false)
      expect(shouldLocalize("user.name@domain.co.uk")).toBe(false)
    })

    it("SVG path data", () => {
      expect(shouldLocalize("M10.5 20.5L30.2 40.5Z")).toBe(false)
      expect(shouldLocalize("M-10.5 -20.5L-30.2 -40.5Z")).toBe(false)
    })

    it("File suffixes", () => {
      expect(shouldLocalize(".json")).toBe(false)
      expect(shouldLocalize(".txt")).toBe(false)
      expect(shouldLocalize(".pdf")).toBe(false)
      expect(shouldLocalize(".doc")).toBe(false)
    })
  })

  describe("should return true for", () => {
    it("normal sentences", () => {
      expect(shouldLocalize("This is a test")).toBe(true)
      expect(shouldLocalize("Welcome to our app")).toBe(true)
      expect(shouldLocalize("Foo bar")).toBe(true)
      expect(shouldLocalize("Foo Bar")).toBe(true)
    })

    it("mixed content with numbers and special characters", () => {
      expect(shouldLocalize("You have 3 messages")).toBe(true)
      expect(shouldLocalize("Error #404: Page not found")).toBe(true)
    })

    it("short phrases with at least 3 characters", () => {
      expect(shouldLocalize("Yes")).toBe(true)
      expect(shouldLocalize("No!")).toBe(true)
      expect(shouldLocalize("Buy")).toBe(true)
      expect(shouldLocalize("N/A")).toBe(true)
    })

    it("sentences with punctuation", () => {
      expect(shouldLocalize("Hello, world!")).toBe(true)
      expect(shouldLocalize("Are you sure?")).toBe(true)
    })

    it("multi-line text", () => {
      expect(shouldLocalize("First line\nSecond line")).toBe(true)
      expect(shouldLocalize("Title:\nSubtitle")).toBe(true)
    })
  })
})
