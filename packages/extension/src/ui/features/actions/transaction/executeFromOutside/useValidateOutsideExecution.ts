import type { TypedData } from "@starknet-io/types-js"
import type { Network } from "../../../../../shared/network"
import { encodeChainId } from "../../../../../shared/utils/encodeChainId"
import { constants } from "starknet"
import { isValidOutsideExecutionMessage } from "./utils"
import { useDappFromKnownDappsByHost } from "../../../../services/knownDapps"

/**
 * Validates if the outside execution request is valid for the given network and if is coming from a whitelisted host.
 * @param dataToSign - The typed data to sign, containing the domain and message.
 * @param host - The host of the dapp that is requesting the execution.
 * @param network - The network on which the validation is being performed.
 * @returns {boolean} - True if the outside execution request is valid, false otherwise.
 */
const useValidateOutsideExecution = (
  dataToSign: TypedData,
  host: string,
  network?: Network,
): boolean => {
  const dapp = useDappFromKnownDappsByHost(host)

  if (!network) {
    return false
  }

  const encodedDomainChainId = encodeChainId(dataToSign.domain.chainId)
  const encodedNetworkChainId = encodeChainId(network.chainId)
  const isMainnet = encodedNetworkChainId === constants.StarknetChainId.SN_MAIN

  const isValidOutsideExecution = isValidOutsideExecutionMessage(dataToSign)

  let isWhiteListedHost = true

  if (isMainnet) {
    try {
      const hostUrl = new URL(host)
      const dappUrl = dapp?.dappUrl ? new URL(dapp.dappUrl) : null
      isWhiteListedHost =
        dappUrl !== null &&
        hostUrl.host === dappUrl.host &&
        Boolean(dapp?.executeFromOutsideAllowed)
    } catch (error) {
      console.error("Invalid URL while doing outside execution:", error)
      isWhiteListedHost = false
    }
  }

  return (
    encodedDomainChainId === encodedNetworkChainId &&
    isValidOutsideExecution &&
    isWhiteListedHost
  )
}

export default useValidateOutsideExecution
