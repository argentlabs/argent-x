/**
 * Checks if a given string should be localized.
 * @param text The text to check for localization
 * @returns boolean indicating if the text should be localized
 */
export function shouldLocalize(text: string): boolean {
  // Skip if empty or just whitespace
  if (!text?.trim()) return false

  // Skip if it's just numbers, special characters, or very short
  const hasLetters = /[a-zA-Z]/.test(text)
  if (!hasLetters) return false

  // Skip if too short (likely just an ID or code)
  if (text.length < 3) return false

  // Skip common non-localizable patterns
  const nonLocalizablePatterns = [
    /^\d+$/, // Just numbers
    /^[0-9\-/:.]+$/, // Dates, times, slashes
    /^[A-Z0-9_]+$/, // Constants/enum-like strings
    /^https?:\/\//, // URLs
    /^[\w.-]+@[\w.-]+\.\w+$/, // Email addresses
    /^M-?\d+\.?\d*\s+-?\d+\.?\d*[A-Z\d\s.-]+$/, // SVG path data
    /^[a-zA-Z]+[._-]?\d+$/, // key-like strings (e.g. key123, key_123, key-123)
    /^[a-z]+[A-Z]\w+$/, // camelCase identifiers
    /^[a-z]+[A-Z]\w*(?:-[a-z\d]+)*$/, // CSS-like and camelCase with hyphens (e.g. networkStatuses-all)
    /^[a-z]+(?:-[a-z]+)+$/, // pure hyphenated strings (e.g. accent-hot-pink)
    /^\.[a-z\d]+$/, // File extensions
    /^[a-z-]+(?:-[a-z-]+)*$/, // kebab-case strings (e.g. data-testid values)
    // eslint-disable-next-line no-control-regex
    /^[\u0000-\u001F\u007F-\u009F\u2000-\u3000]+$/, // Control characters and unicode symbols
  ]

  return !nonLocalizablePatterns.some((pattern) => pattern.test(text))
}
