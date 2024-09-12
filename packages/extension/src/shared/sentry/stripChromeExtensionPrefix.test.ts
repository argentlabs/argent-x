import { describe, it, expect } from "vitest"
import { stripChromeExtensionPrefix } from "./stripChromeExtensionPrefix"

describe("stripChromeExtensionPrefix", () => {
  it("should remove the chrome extension prefix from a valid URL", () => {
    const input =
      "chrome-extension://abcdefghijklmnopqrstuvwxyz123456/popup.html"
    const expected = "popup.html"
    expect(stripChromeExtensionPrefix(input)).toBe(expected)
  })

  it("should handle URLs with additional path segments", () => {
    const input =
      "chrome-extension://abcdefghijklmnopqrstuvwxyz123456/js/content.js"
    const expected = "js/content.js"
    expect(stripChromeExtensionPrefix(input)).toBe(expected)
  })

  it("should return an empty string for the root extension URL", () => {
    const input = "chrome-extension://abcdefghijklmnopqrstuvwxyz123456/"
    const expected = ""
    expect(stripChromeExtensionPrefix(input)).toBe(expected)
  })

  it("should not modify URLs that don't match the chrome extension pattern", () => {
    const input = "https://www.example.com/page.html"
    expect(stripChromeExtensionPrefix(input)).toBe(input)
  })

  it("should handle URLs with query parameters", () => {
    const input =
      "chrome-extension://abcdefghijklmnopqrstuvwxyz123456/page.html?param=value"
    const expected = "page.html?param=value"
    expect(stripChromeExtensionPrefix(input)).toBe(expected)
  })

  it("should handle URLs with hash fragments", () => {
    const input =
      "chrome-extension://abcdefghijklmnopqrstuvwxyz123456/page.html#section"
    const expected = "page.html#section"
    expect(stripChromeExtensionPrefix(input)).toBe(expected)
  })

  it("should not modify input if extension ID is shorter than 32 characters", () => {
    const input = "chrome-extension://abcdef/page.html"
    expect(stripChromeExtensionPrefix(input)).toBe(input)
  })

  it("should not modify a standard http URL", () => {
    const input = "http://www.example.com/page.html"
    expect(stripChromeExtensionPrefix(input)).toBe(input)
  })

  it("should not modify a standard https URL", () => {
    const input = "https://www.example.com/page.html"
    expect(stripChromeExtensionPrefix(input)).toBe(input)
  })

  it("should not modify a file URL", () => {
    const input = "file:///C:/Users/username/Documents/file.txt"
    expect(stripChromeExtensionPrefix(input)).toBe(input)
  })

  it("should not modify a data URL", () => {
    const input = "data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=="
    expect(stripChromeExtensionPrefix(input)).toBe(input)
  })

  it("should not modify a mailto URL", () => {
    const input = "mailto:user@example.com"
    expect(stripChromeExtensionPrefix(input)).toBe(input)
  })

  it("should not modify a relative URL", () => {
    const input = "/path/to/resource.html"
    expect(stripChromeExtensionPrefix(input)).toBe(input)
  })

  it("should not modify a URL with no protocol", () => {
    const input = "www.example.com/page.html"
    expect(stripChromeExtensionPrefix(input)).toBe(input)
  })

  it("should not modify an empty string", () => {
    const input = ""
    expect(stripChromeExtensionPrefix(input)).toBe(input)
  })

  it('should not modify a string that starts with "chrome-extension" but is not a valid extension URL', () => {
    const input = "chrome-extension://invalid-extension-id/page.html"
    expect(stripChromeExtensionPrefix(input)).toBe(input)
  })
})
