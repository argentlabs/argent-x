import { isString } from "lodash-es"
import join from "url-join"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { AspectNft } from "./aspect.model"

const baseUrlGoerli = "https://api-testnet.aspect.co/api/v0/assets"
const baseUrlMainnet = "https://api.aspect.co/api/v0/assets"

export interface Collection {
  name: string
  contractAddress: string
  nfts: AspectNft[]
  imageUri?: string
}

export type Collections = Collection[]

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

  return data.assets
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
  if (Array.isArray(assets) && assets.length > 0) {
    return {
      name:
        assets[0].contract.name_custom || assets[0].contract.name || "Untitled",
      contractAddress,
      imageUri: assets[0].contract.image_url,
      nfts: assets,
    }
  }
  return {
    name: "No collectibles",
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

  return data.assets
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

export const getNftPicture = ({ image_uri, image_url_copy }: AspectNft) => {
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
