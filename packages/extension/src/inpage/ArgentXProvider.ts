import { BlockIdentifier, Call, Provider } from "starknet"
import { Network, getProvider } from "../shared/network"
import { isArgentNetwork } from "../shared/network/utils"

export class ArgentXProvider extends Provider {
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
      super(getProvider(network))
    }
  }

  public async callContract(request: Call, blockIdentifier?: BlockIdentifier) {
    return super.callContract(request, blockIdentifier)
  }
}
