import { ethers } from "ethers"
import { isString, upperCase } from "lodash-es"
import { num } from "starknet"

const { toBigInt } = num

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

const argentColorsArray = [
  "02BBA8",
  "29C5FF",
  "0078A4",
  "FFBF3D",
  "FFA85C",
  "FF875B",
  "FF675C",
  "FF5C72",
]

export const getColor = (name: string) => {
  const hash = ethers.utils.id(name).slice(-2)
  const index = parseInt(hash, 16) % argentColorsArray.length
  return argentColorsArray[index]
}

export const stripAddressZeroPadding = (accountAddress: string) => {
  try {
    return num.toHex(toBigInt(num.hexToDecimalString(accountAddress)))
  } catch {
    // ignore parsing errors
  }
  return ""
}

export const getNetworkAccountImageUrl = ({
  accountName,
  networkId,
  accountAddress,
  backgroundColor,
}: {
  accountName: string
  networkId: string
  accountAddress: string
  backgroundColor?: string
}) => {
  const unpaddedAddress = stripAddressZeroPadding(accountAddress)
  const accountIdentifier = `${networkId}::${unpaddedAddress}`
  const background = backgroundColor || getColor(accountIdentifier)
  return generateAvatarImage(accountName, { background })
}
