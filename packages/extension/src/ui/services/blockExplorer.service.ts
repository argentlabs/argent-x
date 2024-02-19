import { addAddressPadding, constants, shortString } from "starknet"
import urlJoin from "url-join"

import { Network } from "../../shared/network"
import { settingsStore } from "../../shared/settings"
import {
  defaultBlockExplorerKey,
  defaultBlockExplorers,
} from "../../shared/settings/defaultBlockExplorers"
import { useKeyValueStorage } from "../hooks/useStorage"
import { getNetworkIdFromChainId } from "../../shared/network/utils"
import { isArgentNetworkId } from "@argent/shared"

export const useBlockExplorerTitle = () => {
  const blockExplorerKey = useKeyValueStorage(settingsStore, "blockExplorerKey")
  const settingsBlockExplorer = defaultBlockExplorers[blockExplorerKey]
  return settingsBlockExplorer?.title ?? "Explorer"
}

export const getBlockExplorerUrlForNetwork = async (network: Network) => {
  const blockExplorerKey = await settingsStore.get("blockExplorerKey")
  const settingsBlockExplorer = defaultBlockExplorers[blockExplorerKey]
  if (isArgentNetworkId(network.id) || network.id === "localhost") {
    return settingsBlockExplorer.url[network.id]
  }

  const encodedChainId = shortString.encodeShortString(network.chainId)

  if (
    Object.values(constants.StarknetChainId).includes(encodedChainId as any)
  ) {
    const blockExprorerNetworkId = getNetworkIdFromChainId(encodedChainId)
    return settingsBlockExplorer.url[blockExprorerNetworkId]
  }

  return defaultBlockExplorers[defaultBlockExplorerKey].url["mainnet-alpha"]
}

export const openBlockExplorerTransaction = async (
  hash: string,
  network: Network,
) => {
  const blockExplorerUrl = await getBlockExplorerUrlForNetwork(network)
  const url = urlJoin(blockExplorerUrl, "tx", hash)
  window.open(url, "_blank")?.focus()
}

export const openBlockExplorerAddress = async (
  network: Network,
  address: string,
) => {
  const paddedAddress = addAddressPadding(address)
  const blockExplorerUrl = await getBlockExplorerUrlForNetwork(network)
  const url = urlJoin(blockExplorerUrl, "contract", paddedAddress)
  window.open(url, "_blank")?.focus()
}
