import { getChainIdFromNetworkId } from "@argent/x-shared"
import { BlockIdentifier, Call, Provider, ProviderInterface } from "starknet5"

import { Network, getProvider5 } from "../shared/network"
import { getPublicRPCNodeUrls, isArgentNetwork } from "../shared/network/utils"
import { FallbackRpcProvider5 } from "../shared/network/FallbackRpcProvider5"

export class ArgentXProvider5 extends Provider implements ProviderInterface {
  constructor(network: Network) {
    // Only expose sequencer provider for argent networks
    if (isArgentNetwork(network)) {
      // Initialising RpcProvider with chainId removes the need for initial RPC calls to `starknet_chainId`
      const nodeUrls = getPublicRPCNodeUrls(network)
      const chainId = getChainIdFromNetworkId(network.id)
      super(new FallbackRpcProvider5({ nodeUrls, chainId }))
    } else {
      // Otherwise, it's a custom network, so we expose the custom provider
      super(getProvider5(network))
    }
  }

  public async callContract(request: Call, blockIdentifier?: BlockIdentifier) {
    return super.callContract(request, blockIdentifier)
  }
}
