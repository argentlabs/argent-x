import { validateAndParseAddress } from "starknet"

import { FACTORY_ADDRESS } from "../../sdk"
import { useSwapProvider } from "../providers"
import { useMulticall } from "./useMulticall"

export function useAllPairs() {
  const { networkId } = useSwapProvider()

  if (!networkId) {
    throw new Error("Network not supported")
  }

  const { result, error } = useMulticall(
    {
      contractAddress: FACTORY_ADDRESS[networkId],
      entrypoint: "get_all_pairs",
    },
    true,
  )

  if (error) {
    console.warn("Call get_all_pairs failed", error)
    return []
  }

  return result?.map((r) => validateAndParseAddress(r)) ?? []
}
