import DataLoader from "dataloader"
import { Call, ProviderInterface } from "starknet"

import { aggregate } from "./aggregate"

export interface DataLoaderOptions {
  maxBatchSize?: number
  batchInterval?: number
}

export const getDataLoader = (
  provider: ProviderInterface,
  multicallAddress: string,
  options: DataLoaderOptions = {
    batchInterval: 500,
    maxBatchSize: 10,
  },
) => {
  const dl = new DataLoader(
    async (calls: readonly Call[]): Promise<(string[] | Error)[]> => {
      dl.clearAll()
      return aggregate(provider, multicallAddress, calls as Call[])
    },
    {
      maxBatchSize: options.maxBatchSize,
      batchScheduleFn(callback) {
        setTimeout(callback, options.batchInterval)
      },
      // cacheKeyFn(call) {
      //   const { contractAddress, entrypoint, calldata = [] } = call
      //   const cacheKeyContractAddress = number.toHex(contractAddress)
      //   const cacheKeyEntrypoint = hash.getSelector(entrypoint)
      //   const cacheKeyCalldata = calldata.map((c) => number.toHex(c)).join("-")
      //   return `${cacheKeyContractAddress}--${cacheKeyEntrypoint}--${cacheKeyCalldata}`
      // },
    },
  )
  return dl
}
