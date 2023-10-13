import { Call, Provider } from "starknet4"
import { Network } from "../shared/network"
import { isArgentNetwork } from "../shared/network/utils"
import { getProviderv4 } from "../shared/network/provider"

export class ArgentXProviderV4 extends Provider {
  constructor(network: Network) {
    // Only expose sequencer provider for argent networks
    if (isArgentNetwork(network)) {
      if (!network.sequencerUrl) {
        throw new Error(
          `No Sequencer URL found for argent network: ${network.id}`,
        )
      }
      super({ sequencer: { baseUrl: network.sequencerUrl } })
    } else {
      // Otherwise, it's a custom network, so we expose the custom provider
      super(getProviderv4(network))
    }
  }

  public async callContract(request: Call, blockIdentifier: any) {
    // TODO: remove console.log
    // TODO: add metrics to track usage
    console.log("ArgentXProvider.callContract", request)
    return super.callContract(request, blockIdentifier)
  }
}
