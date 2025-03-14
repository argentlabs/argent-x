import type { Address, StarknetDomainName } from "@argent/x-shared"
import { isValidAddress, trpcErrorSchema } from "@argent/x-shared"
import { useDebouncedValue } from "@argent/x-ui"
import useSWR from "swr"
import { z } from "zod"
import { starknetId } from "starknet"

import { clientStarknetAddressService } from "../../services/address"

type AddressFromDomainNameResult = {
  /** the normalized address, or undefined if not found */
  result?: Address
  /** an error string that can be displayed */
  error?: string
}

const starknetDomainSchema = z
  .string()
  .refine(
    (value) => value === value.toLowerCase(),
    "Starknet domain names must be lowercase",
  )

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
      if (!domainName.includes(".")) {
        return {
          result: undefined,
        }
      }

      if (!starknetId.isStarkDomain(domainName)) {
        return {
          result: undefined,
          error: `${domainName} not found`,
        }
      }

      const domainValidation = starknetDomainSchema.safeParse(domainName)
      if (!domainValidation.success) {
        return {
          error: domainValidation.error.errors[0].message,
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
      dedupingInterval: 1000 * 60 * 5 * 1,
      refreshInterval: 1000 * 60 * 5 * 1,
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
