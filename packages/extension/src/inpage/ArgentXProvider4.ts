import { Call, Provider, ProviderInterface } from "starknet4"
import { Network } from "../shared/network"
import {
  getRandomPublicRPCNode,
  isArgentNetwork,
} from "../shared/network/utils"
import { getProviderv4 } from "../shared/network/provider"

export class ArgentXProviderV4 extends Provider implements ProviderInterface {
  constructor(network: Network) {
    // Only expose sequencer provider for argent networks
    if (isArgentNetwork(network)) {
      const publicRpcNode = getRandomPublicRPCNode(network)

      const nodeUrl =
        network.id === "mainnet-alpha"
          ? publicRpcNode.mainnet
          : publicRpcNode.testnet

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
