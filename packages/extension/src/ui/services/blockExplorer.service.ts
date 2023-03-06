import { addAddressPadding } from "starknet"
import urlJoin from "url-join"

import { Network } from "../../shared/network"
import { settingsStore } from "../../shared/settings"
import {
  defaultBlockExplorerKey,
  defaultBlockExplorers,
} from "../../shared/settings/defaultBlockExplorers"
import { useKeyValueStorage } from "../../shared/storage/hooks"

export const useBlockExplorerTitle = () => {
  const blockExplorerKey = useKeyValueStorage(settingsStore, "blockExplorerKey")
  const settingsBlockExplorer = defaultBlockExplorers[blockExplorerKey]
  return settingsBlockExplorer?.title ?? "Explorer"
}

export const getBlockExplorerUrlForNetwork = async (network: Network) => {
  const blockExplorerKey = await settingsStore.get("blockExplorerKey")
  const settingsBlockExplorer = defaultBlockExplorers[blockExplorerKey]
  if (
    network.id === "mainnet-alpha" ||
    network.id === "goerli-alpha" ||
    network.id === "goerli-alpha-2" ||
    network.id === "localhost"
  ) {
    return settingsBlockExplorer.url[network.id]
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
