import { isString, upperCase } from "lodash-es"

export const getInitials = (name: string, alphanumeric = false) => {
  if (!isString(name)) {
    return ""
  }
  const filtered = alphanumeric ? name.replace(/[^0-9a-z ]/gi, "") : name
  const uppercase = upperCase(filtered)
  const uppercaseElements = uppercase.split(" ")

  if (uppercaseElements.length === 1) {
    return uppercaseElements[0].substring(0, 2)
  }
  const initials = uppercaseElements.map((n) => n[0])
  return [initials[0], initials[initials.length - 1]].join("")
}

const parseColor = (color: string) => {
  const hex = color.replace("#", "")
  if (!/^[0-9A-F]{6}$/i.test(hex)) {
    throw new Error(`Invalid color ${color}`)
  }
  return `#${hex}`
}

export const generateAvatarImage = (
  name: string,
  options: { background: string; color?: string },
) => {
  // validate background and color are hex colors
  const background = parseColor(options.background)
  const color = parseColor(options.color ?? "#ffffff")

  // get alphanumeric initials (to avoid issues with being outside range of btoa)
  const initials = getInitials(name, true)

  // generate 64x64 svg with initials in the center (horizontal and vertical) with font color and background color and font family Helvetica (plus fallbacks)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="${background}" />
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="28" font-family="Helvetica, Arial, sans-serif" fill="${color}">${initials}</text>
    </svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}
