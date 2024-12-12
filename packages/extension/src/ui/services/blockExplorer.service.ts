import { addAddressPadding, constants, shortString } from "starknet"
import urlJoin from "url-join"

import { isArgentNetworkId } from "@argent/x-shared"
import type { Network } from "../../shared/network"
import { networkService } from "../../shared/network/service"
import { getNetworkIdFromChainId } from "../../shared/network/utils"
import { settingsStore } from "../../shared/settings"
import {
  defaultBlockExplorerKey,
  defaultBlockExplorers,
} from "../../shared/settings/defaultBlockExplorers"
import { useKeyValueStorage } from "../hooks/useStorage"

export const useBlockExplorerTitle = () => {
  const blockExplorerKey = useKeyValueStorage(settingsStore, "blockExplorerKey")
  const settingsBlockExplorer = defaultBlockExplorers[blockExplorerKey]
  return settingsBlockExplorer?.title ?? "Explorer"
}

const getBlockExplorerCampaignParams = async () => {
  const blockExplorerKey = await settingsStore.get("blockExplorerKey")
  return defaultBlockExplorers[blockExplorerKey]?.campaignParams ?? ""
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
  const campaignParams = await getBlockExplorerCampaignParams()
  const url = urlJoin(blockExplorerUrl, "tx", hash, campaignParams)
  window.open(url, "_blank")?.focus()
}

export const openBlockExplorerAddress = async (
  network: Network,
  address: string,
) => {
  const paddedAddress = addAddressPadding(address)
  const blockExplorerUrl = await getBlockExplorerUrlForNetwork(network)
  const campaignParams = await getBlockExplorerCampaignParams()
  const url = urlJoin(
    blockExplorerUrl,
    "contract",
    paddedAddress,
    campaignParams,
  )
  window.open(url, "_blank")?.focus()
}

export const onBlockExplorerOpenTransaction = async ({
  hash,
  networkId,
}: {
  hash: string
  networkId: string
}) => {
  const network = await networkService.getById(networkId)
  return openBlockExplorerTransaction(hash, network)
}

export const onBlockExplorerOpenAddress = async ({
  address,
  networkId,
}: {
  address: string
  networkId: string
}) => {
  const network = await networkService.getById(networkId)
  return openBlockExplorerAddress(network, address)
}
