import { getChainIdFromNetworkId } from "@argent/shared"
import { BlockIdentifier, Call, Provider, ProviderInterface } from "starknet"

import { Network, getProvider } from "../shared/network"
import { FallbackRpcProvider } from "../shared/network/FallbackRpcProvider"
import { getPublicRPCNodeUrls, isArgentNetwork } from "../shared/network/utils"

export class ArgentXProvider extends Provider implements ProviderInterface {
  constructor(network: Network) {
    // Only expose sequencer provider for argent networks
    if (isArgentNetwork(network)) {
      // Initialising RpcProvider with chainId removes the need for initial RPC calls to `starknet_chainId`
      const nodeUrls = getPublicRPCNodeUrls(network)
      const chainId = getChainIdFromNetworkId(network.id)
      super(new FallbackRpcProvider({ nodeUrls, chainId }))
    } else {
      // Otherwise, it's a custom network, so we expose the custom provider
      super(getProvider(network))
    }
  }

  public async callContract(request: Call, blockIdentifier?: BlockIdentifier) {
    return super.callContract(request, blockIdentifier)
  }
}
