import { addAddressPadding } from "starknet"
import join from "url-join"

import { Network } from "../../shared/network"

export const getVoyagerContractLink = (
  address: string,
  network: Network,
): string => {
  const { explorerUrl } = network
  if (!explorerUrl) {
    return ""
  }
  return join(explorerUrl, "contract", address)
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
  const paddedAddress = addAddressPadding(address)
  window
    .open(`${network.explorerUrl}/contract/${paddedAddress}`, "_blank")
    ?.focus()
}
