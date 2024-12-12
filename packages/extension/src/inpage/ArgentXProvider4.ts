import type { Call, ProviderInterface } from "starknet4"
import { Provider } from "starknet4"
import type { Network } from "../shared/network"
import { getRandomPublicRPCNode } from "../shared/network/utils"
import { getProviderv4 } from "./provider"
import { argentApiNetworkForNetwork } from "../shared/api/headers"

export class ArgentXProviderV4 extends Provider implements ProviderInterface {
  constructor(network: Network) {
    // Only expose sequencer provider for argent networks
    const key = argentApiNetworkForNetwork(network.id)
    if (key) {
      const publicRpcNode = getRandomPublicRPCNode(network)
      const nodeUrl = publicRpcNode[key]
      super({ rpc: { nodeUrl } })
    } else {
      // Otherwise, it's a custom network, so we expose the custom provider
      super(getProviderv4(network))
    }
  }

  public async callContract(request: Call, blockIdentifier: any) {
    return super.callContract(request, blockIdentifier)
  }
}
