import useSWR from "swr"
import join from "url-join"

import { fetcher } from "../../../shared/api/fetcher"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { AspectNft } from "./aspect.model"

const baseUrlGoerli = "https://api-testnet.aspect.co/api/v0/assets"
const baseUrlMainnet = "https://api.aspect.co/api/v0/assets"

export interface Collection {
  name: string
  contractAddress: string
  nfts: AspectNft[]
  imageUri: string
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
  try {
    const params = new URLSearchParams({ owner_address: address })
    const response = await fetch(join(url, `?${params}`, "&limit=50"))
    const data = await response.json()

    if (data.next_url) {
      return data.assets.concat(
        await fetchAspectNftsByUrl(data.next_url, address),
      )
    }
    return data.assets
  } catch {
    return []
  }
}

export const fetchAspectCollection = async (
  account?: BaseWalletAccount,
  contractAddress?: string,
): Promise<Collection | null> => {
  try {
    if (!account || !contractAddress) {
      throw new Error("Account and Contract Address are required")
    }

    const baseUrl = getAspectBaseUrl(account)

    const params = new URLSearchParams({
      owner_address: account.address,
      contract_address: contractAddress,
    })

    const response = await fetch(join(baseUrl, `?${params}`, "&limit=50"))
    const data = await response.json()

    if (data.next_url) {
      return data.assets.concat(
        await fetchAspectCollection(data.next_url, account.address),
      )
    }

    return {
      name: data.assets[0].contract.name_custom,
      contractAddress,
      imageUri: data.assets[0].contract.image_url,
      nfts: data.assets,
    }
  } catch {
    return null
  }
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
  return useSWR<AspectNft>(contractAddress && tokenId && url, fetcher)
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
