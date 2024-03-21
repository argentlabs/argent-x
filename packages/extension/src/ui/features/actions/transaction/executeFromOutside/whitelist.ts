import { Address, addressSchema } from "@argent/x-shared"

// Contracts to be whitelisted for execute_from_outside
const OUTSIDE_EXEC_WHITELIST = [
  "0x0127021a1b5a52d3174c2ab077c2b043c80369250d29428cee956d76ee51584f", // AVNU Caller
]

// This makes sure that the contracts are valid addresses
export function getWhitelistedContracts(): Address[] {
  return OUTSIDE_EXEC_WHITELIST.map((address) => addressSchema.parse(address))
}
