import { isString } from "lodash-es"
import { number } from "starknet"
import useSWR from "swr"
import join from "url-join"

import { fetchData, withPolling } from "../http"
import { AspectContract, AspectNft } from "./aspect.model"

const baseUrlGoerli = "https://api-testnet.aspect.co/api/v0/assets"
const baseUrlMainnet = "https://api.aspect.co/api/v0/assets"

export interface Collection {
  name: string
  contractAddress: string
  nfts: AspectNft[]
  imageUri?: string
  floorPrice?: number.BigNumberish
}

export type Collections = Collection[]

const getAspectBaseUrl = (networkId: string) => {
  const url =
    networkId === "goerli-alpha" || networkId === "SN_GOERLI"
      ? baseUrlGoerli
      : (networkId === "mainnet-alpha" || networkId === "SN_MAIN") &&
        baseUrlMainnet

  if (!url) {
    throw new Error("Unknown network")
  }

  return url
}

export const fetchAspectNfts = async (
  address: string,
  networkId: string,
): Promise<AspectNft[]> => {
  try {
    const baseUrl = getAspectBaseUrl(networkId)
    return fetchAspectNftsByUrl(baseUrl, address)
  } catch {
    return []
  }
}

export const fetchAspectNftsByUrl = async (
  url: string,
  address: string,
): Promise<AspectNft[]> => {
  const params = new URLSearchParams({ owner_address: address })
  const assets = await fetchNextAspectNftsByUrl(
    join(url, `?${params}`, "&limit=50"),
    address,
  )
  return assets
}

export const fetchNextAspectNftsByUrl = async (
  url: string,
  address: string,
): Promise<AspectNft[]> => {
  const response = await fetch(url)
  if (!response.ok) {
    return []
  }

  const data = await response.json()

  if (isString(data.next_url)) {
    return data.assets.concat(
      await fetchNextAspectNftsByUrl(data.next_url, address),
    )
  }

  return data.assets
}

export const fetchAspectCollection = async (
  address: string,
  networkId: string,
  contractAddress?: string,
): Promise<Collection> => {
  if (!address || !contractAddress) {
    throw new Error("Account and Contract Address are required")
  }
  const baseUrl = getAspectBaseUrl(networkId)

  const params = new URLSearchParams({
    owner_address: address,
    contract_address: contractAddress,
  })

  const url = join(baseUrl, `?${params}`, "&limit=50")
  const assets = await fetchNextAspectCollection(url, address, contractAddress)
  if (Array.isArray(assets) && assets.length > 0) {
    return {
      name:
        assets[0].contract.name_custom || assets[0].contract.name || "Untitled",
      contractAddress,
      imageUri: assets[0].contract.image_url,
      floorPrice: assets[0].contract.floor_list_price,
      nfts: assets,
    }
  }
  return {
    name: "No NFTs",
    contractAddress,
    nfts: [],
  }
}

export const fetchNextAspectCollection = async (
  url: string,
  address: string,
  contractAddress: string,
): Promise<AspectNft[]> => {
  const response = await fetch(url)
  if (!response.ok) {
    return []
  }

  const data = await response.json()

  if (isString(data.next_url)) {
    return data.assets.concat(
      await fetchNextAspectCollection(data.next_url, address, contractAddress),
    )
  }

  return data.assets
}

export const fetchNextAspectContractAddresses = async (
  url: string,
): Promise<string[]> => {
  const response = await fetch(url)
  if (!response.ok) {
    return []
  }

  const data = await response.json()
  const contractAddresses = data.contracts.map(
    (contract: AspectContract) => contract.contract_address,
  )

  if (isString(data.next_url)) {
    return contractAddresses.concat(
      await fetchNextAspectContractAddresses(data.next_url),
    )
  }

  return contractAddresses
}

export const fetchAspectContractAddresses = async () => {
  /** there are a huge number of contracts on testnet, we only really care about and fetch mainnet */
  const contractAddresses = await fetchNextAspectContractAddresses(
    "https://api.aspect.co/api/v0/contracts",
  )
  return contractAddresses
}

export const useAspectContractAddresses = () => {
  return useSWR(
    "aspectContractAddresses",
    fetchAspectContractAddresses,
    withPolling(24 * 60 * 60 * 1000) /** 1 day */,
  )
}

export const useAspectNft = (
  contractAddress: string | undefined,
  tokenId: string | undefined,
  networkId: string,
) => {
  const url =
    networkId === "goerli-alpha"
      ? `https://api-testnet.aspect.co/api/v0/asset/${contractAddress}/${tokenId}`
      : `https://api.aspect.co/api/v0/asset/${contractAddress}/${tokenId}`
  return useSWR<AspectNft>(contractAddress && tokenId && url, fetchData)
}
