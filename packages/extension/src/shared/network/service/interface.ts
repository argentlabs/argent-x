import { Network } from "../type"

export interface INetworkService {
  add(network: Network): Promise<boolean>
}
