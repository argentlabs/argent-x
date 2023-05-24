export const isAllowedAddressHexInputValue = (value: string) => {
  const hexRegex = /^(0|0x([a-f0-9A-F]+)?)$/
  if (value === "") {
    return true
  }
  if (hexRegex.test(value)) {
    return true
  }
  return false
}
