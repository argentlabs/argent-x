import { isString } from "lodash-es"
import useSWR, { SWRConfiguration } from "swr"
import join from "url-join"
import { z } from "zod"

import { fetcher } from "../../../shared/api/fetcher"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { withPolling } from "../../services/swr"
import {
  AspectContract,
  AspectNft,
  AspectNftArraySchema,
  Collection,
} from "./aspect.model"

const baseUrlGoerli = "https://api-testnet.aspect.co/api/v0/assets"
const baseUrlMainnet = "https://api.aspect.co/api/v0/assets"

const getAspectBaseUrl = (account: BaseWalletAccount) => {
  const url =
    account.networkId === "goerli-alpha"
      ? baseUrlGoerli
      : account.networkId === "mainnet-alpha" && baseUrlMainnet

  if (!url) {
    throw new Error("Unknown network")
  }

  return url
}

export const fetchAspectNfts = async (
  account: BaseWalletAccount,
): Promise<AspectNft[]> => {
  try {
    const { address } = account
    const baseUrl = getAspectBaseUrl(account)

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
  return AspectNftArraySchema.parse(data.assets)
}

export const fetchAspectCollection = async (
  account?: BaseWalletAccount,
  contractAddress?: string,
): Promise<Collection> => {
  if (!account || !contractAddress) {
    throw new Error("Account and Contract Address are required")
  }
  const { address } = account
  const baseUrl = getAspectBaseUrl(account)

  const params = new URLSearchParams({
    owner_address: address,
    contract_address: contractAddress,
  })

  const url = join(baseUrl, `?${params}`, "&limit=50")
  const assets = await fetchNextAspectCollection(url, account, contractAddress)
  if (assets.length > 0) {
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
  account: BaseWalletAccount,
  contractAddress: string,
): Promise<AspectNft[]> => {
  const response = await fetch(url)
  if (!response.ok) {
    return []
  }

  const data = await response.json()

  if (isString(data.next_url)) {
    return data.assets.concat(
      await fetchNextAspectCollection(data.next_url, account, contractAddress),
    )
  }
  return AspectNftArraySchema.parse(data.assets)
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
  return z.string().array().parse(contractAddresses)
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
  swrConfig?: SWRConfiguration,
) => {
  const url =
    networkId === "goerli-alpha"
      ? `https://api-testnet.aspect.co/api/v0/asset/${contractAddress}/${tokenId}`
      : `https://api.aspect.co/api/v0/asset/${contractAddress}/${tokenId}`
  return useSWR<AspectNft>(
    contractAddress && tokenId && url,
    fetcher,
    swrConfig,
  )
}

export const openAspectNft = (
  contractAddress: string,
  tokenId: string,
  networkId: string,
) => {
  const url =
    networkId === "goerli-alpha"
      ? `https://testnet.aspect.co/asset/${contractAddress}/${tokenId}`
      : `https://aspect.co/asset/${contractAddress}/${tokenId}`
  window.open(url, "_blank")?.focus()
}

export const getNftPicture = ({
  image_uri,
  image_url_copy,
}: Pick<AspectNft, "image_uri" | "image_url_copy">) => {
  if (image_uri && image_url_copy) {
    if (!image_url_copy.startsWith("ipfs://")) {
      return image_url_copy
    }
    if (!image_uri.startsWith("ipfs://")) {
      return image_uri
    }
  }
  if (image_url_copy) {
    return image_url_copy
  }
  return image_uri
}
