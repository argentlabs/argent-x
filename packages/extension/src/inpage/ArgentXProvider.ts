import { BlockIdentifier, Call, Provider, ProviderInterface } from "starknet"
import { Network, getProvider } from "../shared/network"
import {
  getRandomPublicRPCNode,
  isArgentNetwork,
} from "../shared/network/utils"

export class ArgentXProvider extends Provider implements ProviderInterface {
  constructor(network: Network) {
    // Only expose sequencer provider for argent networks
    if (isArgentNetwork(network)) {
      const publicRpcNode = getRandomPublicRPCNode(network)
      if (network.id === "mainnet-alpha") {
        if (!network.sequencerUrl) {
          throw new Error("Missing sequencer url for mainnet")
        }
        super({ sequencer: { baseUrl: network.sequencerUrl } })
      } else {
        super({ rpc: { nodeUrl: publicRpcNode.testnet } })
      }
    } else {
      // Otherwise, it's a custom network, so we expose the custom provider
      super(getProvider(network))
    }
  }

  public async callContract(request: Call, blockIdentifier?: BlockIdentifier) {
    return super.callContract(request, blockIdentifier)
  }
}
