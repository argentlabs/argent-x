import join from "url-join"

import { Network } from "../../shared/networks"
import { normalizeAddress } from "./addresses"

export const getVoyagerContractLink = (
  address: string,
  network: Network,
): string => {
  const { explorerUrl } = network
  if (!explorerUrl) {
    return ""
  }
  return join(explorerUrl, "contract", normalizeAddress(address))
}

export const getVoyagerTransactionLink = (
  hash: string,
  network: Network,
): string => {
  const { explorerUrl } = network
  if (!explorerUrl) {
    return ""
  }
  return join(explorerUrl, "tx", hash)
}

export const openVoyagerTransaction = (hash: string, network: Network) => {
  window.open(getVoyagerTransactionLink(hash, network), "_blank")?.focus()
}

export const openVoyagerAddress = (network: Network, address: string) => {
  window.open(`${network.explorerUrl}/contract/${address}`, "_blank")?.focus()
}
