import { isString, upperCase } from "lodash-es"

const getWholeNumberAtEnd = (inputString: string) => {
  if (!isString(inputString)) {
    return undefined
  }
  const regex = /(\d+)$/
  const match = inputString.match(regex)
  if (match) {
    return match[1]
  }
  return undefined
}

export const getInitials = (name: string, alphanumeric = false) => {
  if (!isString(name)) {
    return ""
  }
  const filtered = alphanumeric ? name.replace(/[^0-9a-z ]/gi, "") : name
  const uppercase = upperCase(filtered)
  const uppercaseElements = uppercase.split(" ")
  const wholeNumberAtEnd = getWholeNumberAtEnd(filtered)

  const initials = uppercaseElements.map((n) => n[0])

  /** if it ends with a whole number, include that up to 2 characters */
  if (wholeNumberAtEnd && wholeNumberAtEnd.length > 1) {
    if (wholeNumberAtEnd.length < filtered.length) {
      return [initials[0], wholeNumberAtEnd.substring(0, 2)].join("")
    }
  }

  /** if it's a single string, return first two characters */
  if (uppercaseElements.length === 1) {
    return uppercaseElements[0].substring(0, 2)
  }

  return [initials[0], initials[initials.length - 1]].join("")
}
