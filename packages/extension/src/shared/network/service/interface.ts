import { SelectorFn } from "../../storage/__new/interface"
import { Network } from "../type"

export interface INetworkService {
  get(selector?: SelectorFn<Network>): Promise<Network[]>
  getById(networkId: string): Promise<Network>
  getByChainId(chainId: string): Promise<Network | undefined>
  add(network: Network): Promise<void>
  removeById(networkId: string): Promise<void>
  restoreDefaults(): Promise<void>
}
