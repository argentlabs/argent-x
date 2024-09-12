import {
  Address,
  StarknetDomainName,
  isStarknetDomainName,
  isValidAddress,
  useDebouncedValue,
  trpcErrorSchema,
} from "@argent/x-shared"
import useSWR from "swr"

import { clientStarknetAddressService } from "../../services/address"

type AddressFromDomainNameResult = {
  /** the normalized address, or undefined if not found */
  result?: Address
  /** an error string that can be displayed */
  error?: string
}

/** debounced version of `useGetAddressFromDomainName` suitable for user input */

export function useGetAddressFromDomainNameInput(
  domainName: StarknetDomainName,
  networkId: string,
) {
  const debouncedDomainName = useDebouncedValue(domainName, 500)
  return useGetAddressFromDomainName(debouncedDomainName, networkId)
}

export function useGetAddressFromDomainName(
  domainName: StarknetDomainName,
  networkId: string,
) {
  const { data, isValidating: isLoading } = useSWR(
    [domainName, networkId],
    async (): Promise<AddressFromDomainNameResult> => {
      if (!isStarknetDomainName(domainName)) {
        return {
          result: undefined,
        }
      }
      try {
        const domainAddress =
          await clientStarknetAddressService.getAddressFromDomainName(
            domainName,
            networkId,
          )
        return {
          result: domainAddress,
        }
      } catch (e) {
        const trpcError = trpcErrorSchema.safeParse(e)
        if (trpcError.success) {
          return {
            error: trpcError.data.data.message,
          }
        }
        return {
          error: `Error resolving ${domainName} - ${e}`,
        }
      }
    },
    {
      dedupingInterval: 1000 * 60 * 60 * 1,
      refreshInterval: 1000 * 60 * 60 * 1,
    },
  )

  const { result, error } = data || {}

  const isValid = result ? isValidAddress(result) : false

  return {
    isLoading,
    error,
    result,
    isValid,
  }
}
