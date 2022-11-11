import DataLoader from "dataloader"
import { Call, ProviderInterface } from "starknet"

import { DataLoaderOptions, getDataLoader } from "./dataloader"

const DEFAULT_MULTICALL_ADDRESS =
  "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4"

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
