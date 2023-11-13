import { Call, CallData } from "starknet"
import useSWR from "swr"

import { useSwapProvider } from "../providers"
import { NoMulticallError } from "../services/multicall"

export const useMulticall = (call: Call, unique = false) => {
  const { multicall, selectedAccount, networkId } = useSwapProvider()
  const { contractAddress, entrypoint, calldata } = call

  const key = [
    contractAddress,
    entrypoint,
    networkId,
    ...CallData.toCalldata(calldata),
    ...(unique ? [selectedAccount?.address] : []),
  ]
    .filter(Boolean)
    .join("-")

  const {
    data: result,
    isValidating: loading,
    ...rest
  } = useSWR(
    key,
    async () => {
      if (!multicall) {
        throw new NoMulticallError("Multicall not available")
      }

      const { result } = await multicall.callContract(call)
      return result
    },
    {
      shouldRetryOnError: (err) => {
        if (err instanceof NoMulticallError) {
          /** no use retrying if there is no multicall address */
          return false
        }
        return true
      },
      refreshInterval: 60e3,
    },
  )

  return { result, loading, ...rest }
}
