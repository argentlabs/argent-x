import join from "url-join"

import { Network } from "../../shared/networks"
import { VoyagerTransaction } from "./voyager.model"

export const fetchVoyagerTransactions = async (
  address: string,
  network: Network,
): Promise<VoyagerTransaction[]> => {
  const { explorerUrl } = network
  if (!explorerUrl) {
    return []
  }
  const response = await fetch(join(explorerUrl, "api/txns", `?to=${address}`))
  const { items } = await response.json()
  return items
}

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
