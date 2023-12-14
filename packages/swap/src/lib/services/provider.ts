import { memoize } from "lodash-es"
import { RpcProvider, constants } from "starknet"

export const getRpcProvider = memoize(
  (nodeUrl: string, chainId?: constants.StarknetChainId) => {
    return new RpcProvider({ nodeUrl, chainId })
  },
  (baseUrl) => baseUrl,
)
