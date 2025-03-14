import * as t from "@babel/types"
import { camelCase } from "lodash-es"

// Helper to truncate string to nearest word boundary
function truncateToNearestWord(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str
  }

  // Find the last space before maxLength
  const lastSpace = str.lastIndexOf(" ", maxLength)
  if (lastSpace === -1) {
    return str.substring(0, maxLength)
  }
  return str.substring(0, lastSpace)
}

// Helper to generate translation key from string
export function generateTranslationKey(
  str: string,
  prefix = "",
  variables: Array<string> = [],
): string {
  // Remove interpolation placeholders to generate a cleaner key
  let processedStr = str
  variables.forEach((varName) => {
    const placeholder = `{{${varName}}}`
    processedStr = processedStr.replace(placeholder, "")
  })

  const normalizedStr = processedStr.replace(/[^\p{L}\p{N}]+/gu, " ").trim()

  const truncatedStr = truncateToNearestWord(normalizedStr, 40)
  const key = camelCase(truncatedStr)

  // If the prefix is a screen/component name, nest the key under it
  if (prefix) {
    return `${camelCase(prefix)}.${key}`
  }
  return key
}

// Helper to check if a string starts with uppercase
export function startsWithUppercase(str: string): boolean {
  return /^[A-Z]/.test(str.trim())
}

// Helper to get a semantic variable name from an expression
export function getVariableName(
  expr: t.Expression,
  expressionsLength: number,
): string {
  if (t.isIdentifier(expr)) {
    return expr.name
  }
  if (t.isMemberExpression(expr) && t.isIdentifier(expr.property)) {
    return expr.property.name
  }
  return `var${expressionsLength}`
}

// Helper to check if an expression is just whitespace
export function isWhitespaceExpression(expr: t.Expression): boolean {
  return t.isStringLiteral(expr) && /^\s+$/.test(expr.value)
}

// Helper to clean text content
export function cleanTextContent(text: string): string {
  // Remove leading/trailing whitespace and normalize internal spaces
  return text.replace(/\s+/g, " ").trim()
}
