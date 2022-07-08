import { formatTruncatedAddress as formatTruncatedAddressOriginal } from "../src/ui/services/addresses"

export { formatTruncatedAddress as formatTruncatedAddressOriginal } from "../src/ui/services/addresses"

export function formatTruncatedAddress(address: string) {
  return formatTruncatedAddressOriginal(address).replaceAll(" ", "")
}
