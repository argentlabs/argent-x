import DataLoader from "dataloader"
import { Call, ProviderInterface } from "starknet"

import { DataLoaderOptions, getDataLoader } from "./dataloader"

const DEFAULT_MULTICALL_ADDRESS =
  "0x023c0c3c23fc5d210aeed505e787fa28ccce2222d18c61846f987dea532b1a68"

export class Multicall {
  public readonly dataloader: DataLoader<Call, string[], Call>

  constructor(
    public readonly provider: ProviderInterface,
    public readonly address: string = DEFAULT_MULTICALL_ADDRESS,
    dataLoaderOptions?: DataLoaderOptions,
  ) {
    this.dataloader = getDataLoader(provider, address, dataLoaderOptions)
  }

  public call(call: Call): Promise<string[]> {
    return this.dataloader.load(call)
  }
}
