import { useMemo } from "react"
import { validateAndParseAddress } from "starknet"

export function useAddressNormalizer(
  addr: string | null | undefined,
): string | null {
  return useMemo(() => {
    if (addr && typeof addr === "string") {
      return validateAndParseAddress(addr)
    }
    return null
  }, [addr])
}
