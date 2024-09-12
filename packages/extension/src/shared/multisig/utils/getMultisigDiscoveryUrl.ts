import urlJoin from "url-join"
import { ARGENT_MULTISIG_DISCOVERY_URL } from "../../api/constants"
import { RecoveryError } from "../../errors/recovery"
import { Network } from "../../network"
import { networkIdToStarknetNetwork } from "../../utils/starknetNetwork"

export function getMultisigDiscoveryUrl(network: Network) {
  const backendNetwork = networkIdToStarknetNetwork(network.id)

  // Don't check for multisig accounts if the network doesn't support them
  if (!network.accountClassHash?.multisig) {
    return
  }

  const baseDiscoveryUrl = ARGENT_MULTISIG_DISCOVERY_URL

  if (!baseDiscoveryUrl) {
    throw new RecoveryError({
      code: "ARGENT_MULTISIG_DISCOVERY_URL_NOT_SET",
    })
  }

  return urlJoin(baseDiscoveryUrl, backendNetwork)
}
